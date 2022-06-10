package handler

import (
	"encoding/json"
	"fmt"
	"strings"

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

func UpdateProduct(c *fiber.Ctx) error {

	// Validate POST request body.
	update_product := new(model.UpdateProduct)
	err := validator.InputValidator(update_product, c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation error", "data": err.Error()})
	}

	// Get user id from middleware
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	store_id := claims["user_id"].(string)

	// Check if product exists and user owns the product
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err.Error()})
	}

	sqlQuery := `SELECT product_id FROM products WHERE product_id=$1 AND store_id=$2`
	row := db.QueryRow(sqlQuery, update_product.ProductId, store_id)
	if err := row.Scan(&update_product.ProductId); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't update product", "data": err.Error()})
	}

	// Update product
	var colToUpdate []string
	var updateProdInterface map[string]interface{}
	inrec, _ := json.Marshal(update_product)
	json.Unmarshal(inrec, &updateProdInterface)
	// iterate through inrecs
	for field, val := range updateProdInterface {
		if field != "product_id" && field != "images" {
			colToUpdate = append(colToUpdate, fmt.Sprintf("%v = '%v'", field, val))
		} else if field == "images" {
			var ImageURLs []string
			for _, url := range val.([]interface{}) {
				ImageURL := fmt.Sprintf(`"%v"`, url)
				ImageURLs = append(ImageURLs, ImageURL)
			}
			val = strings.Join(ImageURLs, ",")
			colToUpdate = append(colToUpdate, fmt.Sprintf(`%v = '{%v}'`, field, val))
		}
	}

	sqlQuery = "UPDATE products SET " + strings.Join(colToUpdate[:], ", ") + " WHERE product_id = " + "'" + update_product.ProductId + "'"
	fmt.Println(sqlQuery)
	_, err = db.Exec(sqlQuery)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't update product", "data": err.Error()})
	}

	return c.SendStatus(fiber.StatusOK)
}
