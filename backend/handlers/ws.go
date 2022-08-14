package handler

import (
	"encoding/json"
	"log"
	"time"

	"github.com/JoaquinOlivero/FoodieMakers/config"
	"github.com/gofiber/websocket/v2"
)

type Client struct {
	UserId string
	ChatId string
} // Add more data to this type if needed

type Register struct {
	PointerKey *websocket.Conn
	UserId     string
}

type Command struct {
	UserConnection *websocket.Conn
	Data           Message
}

type Message struct {
	Action string `json:"action"`
	Text   string `json:"text"`
	ChatId string `json:"chat_id"`
	UserId string `json:"user_id"`
}

const (
	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
)

var (
	clients    = make(map[*websocket.Conn]Client) // Note: although large maps with pointer-like types (e.g. strings) as keys are slow, using pointers themselves as keys is acceptable and fast
	register   = make(chan *websocket.Conn)
	command    = make(chan Command)
	unregister = make(chan *websocket.Conn)
)

func runHub(c *websocket.Conn, ticker *time.Ticker) {

	for {
		select {
		case connection := <-register:
			clients[connection] = Client{connection.Query("userId"), connection.Query("chatId")}
			log.Printf("User %v connected.\n", clients[connection].UserId)

		case message := <-command:

			action := message.Data.Action

			switch action {
			case "userChats": // Get user chats, their latest message and count of unread messages.
				userId := message.UserConnection.Query("userId")
				getUserChat(userId, message.UserConnection)
			case "singleChat": // Get requested chat by user.
				userId := message.UserConnection.Query("userId")
				chatId := message.Data.ChatId
				getSingleChat(userId, chatId, message.UserConnection)
			case "sendMessage": // Send message to expected client and save to db.
				chatId := message.Data.ChatId
				senderUserId := message.UserConnection.Query("userId")
				sendChatMessage(message.Data.Text, chatId, senderUserId)
			case "refreshChat":
				userId := message.Data.UserId
				refreshUserChat(userId)
			case "newMessageNotification": // Send new message notification

			}

		case <-ticker.C: // Handle connection by sending a ping message.
			if err := c.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				return
			}

		case connection := <-unregister: // Remove the client from the hub
			userId := clients[connection].UserId
			log.Printf("User %v disconnecting.\n", userId)
			delete(clients, connection)
			log.Printf("User %v disconnected.\n", userId)

		}

	}
}

func WebSocketConnections(c *websocket.Conn) {
	ticker := time.NewTicker(pingPeriod)
	go runHub(c, ticker)
	// When the function returns, stop the ticker, unregister the client and close the connection
	defer func() {
		ticker.Stop()
		unregister <- c
		c.Close()
	}()

	// Register the client
	register <- c
	c.SetReadDeadline(time.Now().Add(pongWait))
	c.SetPongHandler(func(string) error { c.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {

		messageType, message, err := c.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("read error:", err)

			}
			return // Calls the deferred function, i.e. closes the connection on error
		}

		// Parse JSON message
		var msg Message
		json.Unmarshal(message, &msg)
		if messageType == websocket.TextMessage {
			// send command
			command <- Command{c, msg}
		} else {
			log.Println("websocket message received of type", messageType)
		}

	}

}

func getUserChat(userId string, c *websocket.Conn) {

	// Connect to db
	db, err := config.ConnectDB()
	if err != nil {
		log.Println("Db connection error:", err)
		return
	}

	type M map[string]interface{}

	var (
		chat_id            string
		store_id           string
		client_id          string
		latest_activity    time.Time
		store_name         string
		client_first_name  string
		client_last_name   string
		message_content    string
		message_sender_id  string
		message_read       bool
		message_created_at time.Time
		unread_messages    int32
		chatsMapSlice      []M
	)

	// Get user's chats, the chats' latest message and the number of unread messages.
	sqlQuery := `
	SELECT
		ch.chat_id, 
		ch.store_id, 
		ch.client_id, 
		ch.latest_activity,
		stores.name,
		users.first_name,
		users.last_name,
		msg.content as lastmessage_content,
		msg.sender_id as lastmessage_sender_id,
		msg.read as lastmessage_read,
		msg.created_at as lastmessage_created_at,
		COUNT(msg_count.read) FILTER (WHERE msg_count.read=FALSE) as unread_messages
	FROM chats ch
		JOIN LATERAL (SELECT * FROM messages msg WHERE ch.chat_id = msg.chat_id ORDER BY msg.created_at DESC LIMIT 1) msg ON TRUE
		LEFT JOIN messages msg_count ON ch.chat_id = msg_count.chat_id
		INNER JOIN stores ON ch.store_id = stores.user_id
		INNER JOIN users ON ch.client_id = users.id
	WHERE 
		ch.store_id = $1 OR ch.client_id = $1
	GROUP BY ch.chat_id, stores.name, users.first_name, users.last_name, msg.content, msg.sender_id, msg.read, msg.created_at
	ORDER BY msg.created_at DESC`

	rows, err := db.Query(sqlQuery, userId)
	if err != nil {
		log.Println("Db select error:", err)
		return
	}

	defer rows.Close()

	for rows.Next() {
		err = rows.Scan(&chat_id, &store_id, &client_id, &latest_activity, &store_name, &client_first_name, &client_last_name, &message_content, &message_sender_id, &message_read, &message_created_at, &unread_messages)
		if err != nil {
			log.Println("Db select error:", err)
			return
		}

		// chat's latest message
		// elapsedTime := config.GetElapsedTime(message_created_at)
		// fmt.Println(message_created_at.Format(time.Kitchen)) // 11:00AM

		message := M{"content": message_content, "sender_id": message_sender_id, "is_read": message_read, "send_time": message_created_at, "unread_messages": unread_messages}

		chat := M{"chat_id": chat_id, "store_id": store_id, "client_id": client_id, "latest_activity": latest_activity, "store_name": store_name, "client_first_name": client_first_name, "client_last_name": client_last_name, "latest_message": message}

		chatsMapSlice = append(chatsMapSlice, chat)
	}

	// get any error encountered during iteration
	err = rows.Err()
	if err != nil {
		log.Println("Rows iteration error:", err)
		return
	}

	// Send chats with corresponding action (userChats).
	type AllChats struct {
		Action  string
		Content []M
	}

	message := AllChats{"userChats", chatsMapSlice}

	msg, err := json.Marshal(message)
	if err != nil {
		log.Println("Marshal error:", err)
	}
	err = c.WriteMessage(websocket.TextMessage, []byte(msg))
	if err != nil {
		log.Println("write error:", err)

		c.WriteMessage(websocket.CloseMessage, []byte{})
		c.Close()
		delete(clients, c)
	}

	rows.Close()
}

// Get user's requested chat messages and make user available for real-time messaging by adding the chat id to the current user in the clients slice.
func getSingleChat(userId, chatId string, c *websocket.Conn) {
	// Update user's chat id in client pool
	clients[c] = Client{userId, chatId}

	// Connect to db
	db, err := config.ConnectDB()
	if err != nil {
		log.Println("Db connection error:", err)
		return
	}

	// Update chat unread messages to read
	sqlQuery := `UPDATE messages
	SET read = TRUE
	WHERE chat_id = $1 AND sender_id != $2`
	_, err = db.Exec(sqlQuery, chatId, userId)
	if err != nil {
		log.Println("Could not insert message into database. Error:", err)
		return
	}

	// Get chat data
	type M map[string]interface{}

	var (
		store_id           string
		client_id          string
		message_content    string
		message_sender_id  string
		message_read       bool
		message_created_at time.Time
		store_name         string
		user_first_name    string
		user_last_name     string
		chatMessagesSlice  []M
		chatData           M
	)

	// Get requested chat.
	sqlQuery = `
	SELECT ch.store_id, ch.client_id, msg.content, msg.sender_id, msg.read, msg.created_at , st.name, u.first_name, u.last_name
	FROM chats ch
	INNER JOIN messages msg ON ch.chat_id = msg.chat_id
	INNER JOIN stores st ON ch.store_id = st.user_id
	INNER JOIN users u ON ch.client_id = u.id
	WHERE ch.chat_id = $1
	ORDER BY msg.created_at ASC`
	rows, err := db.Query(sqlQuery, chatId)
	if err != nil {
		log.Println("Db select error:", err)
		return
	}

	defer func() {
		// close rows connection
		rows.Close()
	}()

	for rows.Next() {
		// scan all arguments to save them in their respective variables.
		err = rows.Scan(&store_id, &client_id, &message_content, &message_sender_id, &message_read, &message_created_at, &store_name, &user_first_name, &user_last_name)
		if err != nil {
			log.Println("Db select error:", err)
			return
		}
		// Only map variables that are related to a message.
		message := M{"message": message_content, "sender_id": message_sender_id, "is_read": message_read, "created_at": message_created_at}
		// Append message to slice
		chatMessagesSlice = append(chatMessagesSlice, message)
	}

	// get any error encountered during iteration
	err = rows.Err()
	if err != nil {
		log.Println("Rows iteration error:", err)
		return
	}

	// Append store, user data and messages to chatMapSlice
	chatData = M{"chat_id": chatId, "client_id": client_id, "client_first_name": user_first_name, "client_last_name": user_last_name, "store_id": store_id, "store_name": store_name, "messages": chatMessagesSlice}

	// Send chat data
	type Chat struct {
		Action  string
		Content M
	}

	message := Chat{"singleChat", chatData}

	msg, err := json.Marshal(message)
	if err != nil {
		log.Println("Marshal error:", err)
		return
	}
	err = c.WriteMessage(websocket.TextMessage, []byte(msg))
	if err != nil {
		log.Println("write error:", err)

		c.WriteMessage(websocket.CloseMessage, []byte{})
		c.Close()
		delete(clients, c)
		return
	}

	// close rows connection
	rows.Close()

}

func sendChatMessage(message, chatId, senderUserId string) {

	// Send message to expected user.
	for connection := range clients {
		if clients[connection].ChatId == chatId && clients[connection].UserId != senderUserId {
			type M map[string]interface{}

			type Chat struct {
				Action  string
				Content M
			}

			messageData := M{"message": message, "sender_id": senderUserId, "is_read": true}

			newMessage := Chat{"newMessage", messageData}

			msg, err := json.Marshal(newMessage)
			if err != nil {
				log.Println("Marshal error:", err)
				return
			}
			err = connection.WriteMessage(websocket.TextMessage, []byte(msg))
			if err != nil {
				log.Println("write error:", err)

				connection.WriteMessage(websocket.CloseMessage, []byte{})
				connection.Close()
				delete(clients, connection)
			}

			// Connect to db and insert message.
			db, err := config.ConnectDB()
			if err != nil {
				log.Println("Db connection error:", err)
				return
			}

			sqlQuery := `INSERT INTO messages (content, sender_id, chat_id, read, created_at) VALUES ($1, $2, $3, true, current_timestamp)`
			_, err = db.Exec(sqlQuery, message, senderUserId, chatId)
			if err != nil {
				log.Println("Could not insert message into database. Error:", err)
				return
			}

			db.Close()
			return
		}
	}

	// Connect to db and insert message.
	db, err := config.ConnectDB()
	if err != nil {
		log.Println("Db connection error:", err)
		return
	}

	sqlQuery := `INSERT INTO messages (content, sender_id, chat_id, created_at) VALUES ($1, $2, $3, current_timestamp)`
	_, err = db.Exec(sqlQuery, message, senderUserId, chatId)
	if err != nil {
		log.Println("Could not insert message into database. Error:", err)
		return
	}

	db.Close()

}

func refreshUserChat(userId string) {

	// refresh chat to user when receiving a new message.
	for connection := range clients {
		if clients[connection].UserId == userId {
			getUserChat(userId, connection)
			return
		}
	}
}
