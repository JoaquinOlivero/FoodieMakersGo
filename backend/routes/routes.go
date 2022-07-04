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

	user.Post("/logout", middleware.Protected(), handler.LogoutUser)
	user.Post("/check-token", middleware.Protected(), handler.CheckToken)
	user.Post("/store/create", middleware.Protected(), handler.CreateStore)

	// Product
	product := app.Group("/product")
	product.Get("/:id", handler.GetProduct)
	product.Post("/new", middleware.Protected(), handler.NewProduct)
	product.Post("/update", middleware.Protected(), handler.UpdateProduct)
	product.Post("/delete", middleware.Protected(), handler.DeleteProduct)
	product.Post("/upload-image", middleware.Protected(), handler.UploadImage)
}
