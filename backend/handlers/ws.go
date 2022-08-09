package handler

import (
	"encoding/json"
	"fmt"

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
	Action  string
	Content string
}

var clients = make(map[*websocket.Conn]Client) // Note: although large maps with pointer-like types (e.g. strings) as keys are slow, using pointers themselves as keys is acceptable and fast
var register = make(chan *websocket.Conn)
var command = make(chan Command)
var unregister = make(chan *websocket.Conn)

func RunHub() {
	for {
		select {
		case connection := <-register:
			clients[connection] = Client{connection.Query("userId"), connection.Query("chatId")}
			fmt.Printf("User %v connected.\n", clients[connection].UserId)

		case message := <-command:

			// action := message.UserConnection.Query("action")
			action := message.Data.Action

			switch action {
			case "userChats":
				userId := message.UserConnection.Query("userId")
				fmt.Println(userId)
			case "chatMessage": // Send message to expected client and save to db.
				chatId := message.UserConnection.Query("chatId")
				senderUserId := message.UserConnection.Query("userId")
				sendChatMessage(message.Data.Content, chatId, senderUserId)

			case "newMessage": // Send new message notification

			}

		case connection := <-unregister:
			// Remove the client from the hub
			userId := clients[connection].UserId
			fmt.Printf("User %v disconnecting.\n", userId)
			delete(clients, connection)
			fmt.Printf("User %v disconnected.\n", userId)
		}
	}
}

func WebSocketConnections(c *websocket.Conn) {
	// When the function returns, unregister the client and close the connection
	defer func() {
		unregister <- c
		c.Close()
	}()

	// Register the client
	register <- c

	for {
		messageType, message, err := c.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				// errString := fmt.Sprintf("%v", err.Error())
				// if errString != "websocket: close 1000 (normal)" {
				// 	fmt.Println("read error:", errString)
				// }
				fmt.Println("read error:", err)

			}
			fmt.Println("read error:", err)
			return // Calls the deferred function, i.e. closes the connection on error
		}
		// Parse JSON message
		var msg Message
		json.Unmarshal(message, &msg)

		if messageType == websocket.TextMessage {
			// send command
			command <- Command{c, msg}
		} else {
			fmt.Println("websocket message received of type", messageType)
		}
	}

}

func sendChatMessage(message, chatId, senderUserId string) {

	// Send message to expected user.
	for connection := range clients {
		if clients[connection].ChatId == chatId && clients[connection].UserId != senderUserId {
			err := connection.WriteMessage(websocket.TextMessage, []byte(message))
			if err != nil {
				fmt.Println("write error:", err)

				connection.WriteMessage(websocket.CloseMessage, []byte{})
				connection.Close()
				delete(clients, connection)
			}
		}
	}

	// Connect to db and insert message.
	db, err := config.ConnectDB()
	if err != nil {
		fmt.Println("Db connection error:", err)
		return
	}

	sqlQuery := `INSERT INTO messages (content, sender_id, chat_id, created_at) VALUES ($1, $2, $3, current_timestamp)`
	_, err = db.Exec(sqlQuery, message, senderUserId, chatId)
	if err != nil {
		fmt.Println("Could not insert message into database. Error:", err)
		return
	}
}
