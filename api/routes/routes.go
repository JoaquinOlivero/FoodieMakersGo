package routes

import (
	handler "github.com/JoaquinOlivero/FoodieMakers/handlers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"

	"github.com/JoaquinOlivero/FoodieMakers/middleware"
)

func SetupRoutes(app *fiber.App) {

	// User
	user := app.Group("/user")
	user.Post("/login", handler.LoginUser)
	user.Post("/register", handler.RegisterUser)
	wishlist := user.Group("/wishlist")
	wishlist.Get("", middleware.Protected(), handler.UserWishlist)
	wishlist.Post("/add", middleware.Protected(), handler.AddToWishlist)

	user.Post("/logout", middleware.Protected(), handler.LogoutUser)
	user.Post("/check-token", middleware.Protected(), handler.CheckToken)
	user.Post("/store/create", middleware.Protected(), handler.CreateStore)

	// Product
	product := app.Group("/product")
	product.Get("/search", handler.SearchProducts)
	product.Get("/:id", handler.GetProduct)
	product.Get("/:id/reviews", handler.ProductReviews)
	product.Post("/new", middleware.Protected(), handler.NewProduct)
	product.Post("/update", middleware.Protected(), handler.UpdateProduct)
	product.Post("/delete", middleware.Protected(), handler.DeleteProduct)
	product.Post("/upload-image", middleware.Protected(), handler.UploadImage)

	// Review
	review := app.Group("/review")
	review.Post("/new", middleware.Protected(), handler.NewReview)
	review.Post("/delete", middleware.Protected(), handler.DeleteReview)

	// Chat
	chat := app.Group("/chat")
	chat.Post("/new", middleware.Protected(), handler.NewChat)
	chat.Get("/all", middleware.Protected(), handler.RetrieveAllChats)

	// WebSockets
	app.Get("/ws", websocket.New(handler.WebSocketConnections))
}
