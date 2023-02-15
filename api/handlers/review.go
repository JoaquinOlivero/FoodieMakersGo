package handler

import (
	"time"

	"github.com/JoaquinOlivero/FoodieMakers/config"
	model "github.com/JoaquinOlivero/FoodieMakers/models"
	"github.com/JoaquinOlivero/FoodieMakers/validator"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func NewReview(c *fiber.Ctx) error {

	// Validate POST request body.
	review := new(model.Review)
	err := validator.InputValidator(review, c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation error", "data": err.Error()})
	}

	// Get user id from middleware
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	user_id := claims["user_id"].(string)

	// Check that user_id does not match the product's owner id (review.StoreId)
	if user_id == review.StoreId {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Owner can not review owned products"})
	}

	// Insert review into database
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err.Error()})
	}

	// Check if user already reviewed the product
	var id string
	sqlQuery := `SELECT review_id FROM reviews WHERE product_id=$1 AND author_id=$2`
	err = db.QueryRow(sqlQuery, review.ProductId, user_id).Scan(&id)
	if err == nil { // no error means that the review already exists.
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Product already reviewed by user"})
	}

	// Save review in database
	sqlQuery = `INSERT INTO reviews (title, content, rating, product_id, author_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING review_id`
	err = db.QueryRow(sqlQuery, review.Title, review.Content, review.Rating, review.ProductId, user_id, time.Now()).Scan(&id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't post review", "data": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"review_id": id})
}

func DeleteReview(c *fiber.Ctx) error {

	reviewId := c.Query("review_id")
	productId := c.Query("product_id")

	// Get user id from middleware. Which is the same id as store_id
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	userId := claims["user_id"].(string)

	// Connect to db and Delete product
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err.Error()})
	}

	sqlQuery := "DELETE FROM reviews WHERE review_id=$1 AND author_id=$2 AND product_id=$3"
	res, err := db.Exec(sqlQuery, reviewId, userId, productId)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't delete review", "data": err.Error()})
	}
	// Check if review was deleted
	count, err := res.RowsAffected()
	if count == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Review was not deleted. It's possibly a lack of authorization to do so."})
	}
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't delete review", "data": err.Error()})
	}

	return c.SendStatus(fiber.StatusOK)
}
