package handler

import (
	"github.com/JoaquinOlivero/FoodieMakers/config"
	model "github.com/JoaquinOlivero/FoodieMakers/models"
	"github.com/JoaquinOlivero/FoodieMakers/validator"
	"github.com/lib/pq"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func NewProduct(c *fiber.Ctx) error {

	// Validate POST request body.
	product := new(model.Product)
	err := validator.InputValidator(product, c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation error", "data": err.Error()})
	}

	// Get user id from middleware
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	user_id := claims["user_id"].(string)

	// Check if user has a store and then create product.
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err.Error()})
	}

	// Check whether user has a store
	var sqlQuery string
	sqlQuery = `SELECT user_id FROM stores WHERE user_id=$1`
	row := db.QueryRow(sqlQuery, user_id)
	if err := row.Scan(&user_id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't find store", "data": err.Error()})
	}

	// Insert product into database and retrieve product id
	var product_id string
	sqlQuery = `INSERT INTO products (store_id, title, description, category, images, created_at) VALUES ($1, $2, $3, $4, $5, current_timestamp) RETURNING product_id`
	err2 := db.QueryRow(sqlQuery, user_id, product.Title, product.Description, product.Category, pq.Array(product.Images)).Scan(&product_id)
	if err2 != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't create product", "data": err.Error()})
	}

	return c.JSON(fiber.Map{"product_id": product_id})
}
