package main

import (
	"log"
	"os"

	"github.com/JoaquinOlivero/FoodieMakers/config"
	"github.com/JoaquinOlivero/FoodieMakers/routes"
	"github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
)

func main() {
	// Logging settings.
	file, err := os.OpenFile("logs/log.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}

	log.SetOutput(file)

	// Go Fiber settings.
	app := fiber.New(fiber.Config{
		JSONEncoder: json.Marshal,
		JSONDecoder: json.Unmarshal,
	})
	app.Use(
		cors.New(cors.Config{
			AllowOrigins:     config.Env("CORS_ORIGINS"),
			AllowHeaders:     "Origin, Content-Type, Accept",
			AllowMethods:     "GET, POST",
			AllowCredentials: true,
		}),
	)

	// websockets endpoint.
	app.Use("/ws", func(c *fiber.Ctx) error {
		// IsWebSocketUpgrade returns true if the client
		// requested upgrade to the WebSocket protocol.
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return c.SendStatus(fiber.StatusUpgradeRequired)
	})

	app.Static("/images", config.Env("STATIC_IMAGES_DIRECTORY"))

	routes.SetupRoutes(app)

	// 404
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).SendString("Sorry can't find that!")
	})

	log.Fatal(app.Listen(":4000"))
}
