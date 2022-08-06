package handler

import (
	"time"

	"github.com/JoaquinOlivero/FoodieMakers/config"
	model "github.com/JoaquinOlivero/FoodieMakers/models"
	"github.com/JoaquinOlivero/FoodieMakers/validator"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	_ "github.com/lib/pq"
)

func NewChat(c *fiber.Ctx) error {

	// Validate POST request body.
	chat := new(model.NewChat)
	err := validator.InputValidator(chat, c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation error", "data": err.Error()})
	}

	// Get user id from middleware
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	client_id := claims["user_id"].(string)

	// Check that client_id and chat.StoreId are not equal.
	if client_id == chat.StoreId {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "client_id and store_id are equal"})
	}

	// Connect to db
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err.Error()})
	}

	var chatId string
	// Check that chat does not already exist. If it does send redirect status and chat_id.
	sqlQuery := `SELECT chat_id FROM chats WHERE store_id = $1 AND client_id = $2`
	err = db.QueryRow(sqlQuery, chat.StoreId, client_id).Scan(&chatId)
	if err == nil { // no error means that chat exists.
		return c.Status(fiber.StatusFound).JSON(fiber.Map{"status": "Found", "message": "Chat already exists", "chat_id": chatId})
	}

	// Create new chat in the database.
	sqlQuery = `INSERT INTO chats (store_id, client_id, latest_activity) VALUES($1, $2, $3) RETURNING chat_id`
	err = db.QueryRow(sqlQuery, chat.StoreId, client_id, time.Now()).Scan(&chatId)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't create chat", "data": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"chat_id": chatId})
}

func RetrieveAllChats(c *fiber.Ctx) error {

	// Get user id from middleware
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	user_id := claims["user_id"].(string)

	// Connect to db
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err.Error()})
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
		messages_not_read  int32
		chatsMapSlice      []M
	)

	// Get user's chats and the chats' latest message.
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

	rows, err := db.Query(sqlQuery, user_id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't get chats", "data": err.Error()})
	}
	defer rows.Close()
	for rows.Next() {
		err = rows.Scan(&chat_id, &store_id, &client_id, &latest_activity, &store_name, &client_first_name, &client_last_name, &message_content, &message_sender_id, &message_read, &message_created_at, &messages_not_read)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't get chats", "data": err.Error()})
		}

		// chat's latest message
		elapsedTime := config.GetElapsedTime(message_created_at)
		message := M{"content": message_content, "sender_id": message_sender_id, "is_read": message_read, "send_time": elapsedTime, "messages_not_read": messages_not_read}

		// chat := M{"chat_id": chat_id, "store_id": store_id, "client_id": client_id, "latest_activity": latest_activity, "store_name": store_name, "client_first_name": client_first_name, "client_last_name": client_last_name, "message_content": message_content, "message_sender_id": message_sender_id, "message_read": message_read, "message_created_at": message_created_at}
		chat := M{"chat_id": chat_id, "store_id": store_id, "client_id": client_id, "latest_activity": latest_activity, "store_name": store_name, "client_first_name": client_first_name, "client_last_name": client_last_name, "latest_message": message}

		chatsMapSlice = append(chatsMapSlice, chat)
	}

	// get any error encountered during iteration
	err = rows.Err()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't get chats", "data": err.Error()})
	}

	// Close connection to DB. Just in case
	rows.Close()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"chats": chatsMapSlice})
}
