package routes

import (
	handler "github.com/JoaquinOlivero/FoodieMakers/handlers"
	"github.com/gofiber/fiber/v2"

	"github.com/JoaquinOlivero/FoodieMakers/middleware"
)

func SetupRoutes(app *fiber.App) {

	// User
	user := app.Group("/user")
	user.Post("/login", handler.LoginUser)
	user.Post("/register", handler.RegisterUser)

	user.Post("/store/create", middleware.Protected(), handler.CreateStore)

	// Product
	product := app.Group("/product")
	product.Post("/new", middleware.Protected(), handler.NewProduct)
}
