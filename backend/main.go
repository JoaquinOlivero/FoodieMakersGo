package main

import (
	"log"

	"github.com/JoaquinOlivero/FoodieMakers/routes"
	"github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New(fiber.Config{
		JSONEncoder: json.Marshal,
		JSONDecoder: json.Unmarshal,
	})
	app.Use(
		cors.New(cors.Config{
			AllowOrigins:     "https://foodiemakers.xyz",
			AllowHeaders:     "Origin, Content-Type, Accept",
			AllowMethods:     "GET, POST",
			AllowCredentials: true,
		}),
	)

	app.Static("/images", "/secondDisk/FoodieMakers/images") // the path to the images folder should be different in a docker container so it is better to change the path to a modifiable env variable

	routes.SetupRoutes(app)

	// 404
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).SendString("Sorry can't find that!")
	})

	log.Fatal(app.Listen(":4000"))
}
