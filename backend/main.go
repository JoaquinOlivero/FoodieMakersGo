package main

import (
	"log"

	"github.com/JoaquinOlivero/FoodieMakers/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()
	app.Use(
		cors.New(cors.Config{
			AllowMethods: "GET, POST",
		}),
	)

	routes.SetupRoutes(app)

	// 404
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).SendString("Sorry can't find that!")
	})

	log.Fatal(app.Listen(":7777"))
}
