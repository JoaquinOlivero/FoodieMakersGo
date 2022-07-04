package handler

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/JoaquinOlivero/FoodieMakers/config"
	model "github.com/JoaquinOlivero/FoodieMakers/models"
	"github.com/JoaquinOlivero/FoodieMakers/validator"
	"github.com/google/uuid"
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
	err = db.QueryRow(sqlQuery, user_id, product.Title, product.Description, product.Category, pq.Array(product.Images)).Scan(&product_id)
	if err != nil {
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
		if field != "product_id" && field != "images" && val != "" {
			stringValue := fmt.Sprintf("%v", val)
			formattedValue := strings.ReplaceAll(stringValue, "'", "''")

			colToUpdate = append(colToUpdate, fmt.Sprintf(`%v = '%v'`, field, formattedValue))
		} else if field == "images" && val != nil {
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
	_, err = db.Exec(sqlQuery)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't update product", "data": err.Error()})
	}

	return c.SendStatus(fiber.StatusOK)
}

func DeleteProduct(c *fiber.Ctx) error {

	// Validate POST request body.
	delete_product := new(model.DeleteProduct)
	err := validator.InputValidator(delete_product, c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation error", "data": err.Error()})
	}

	// Get user id from middleware. Which is the same id as store_id
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	store_id := claims["user_id"].(string)

	// Connect to db and Delete product
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err.Error()})
	}

	sqlQuery := "DELETE FROM products WHERE product_id = '" + delete_product.ProductId + "' AND store_id = '" + store_id + "'"
	res, err := db.Exec(sqlQuery)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't delete product", "data": err.Error()})
	}
	// Check if product was deleted
	count, err := res.RowsAffected()
	if count == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Product was not deleted. It's possible a lack of authorization to do so."})
	}
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't delete product", "data": err.Error()})
	}

	return c.SendStatus(fiber.StatusOK)
}

func GetProduct(c *fiber.Ctx) error {

	// Get product from database matching id from params.
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err.Error()})
	}

	var (
		product_id  string
		store_id    string
		title       string
		description string
		category    string
		images      []string
		created_at  string
		user_id     string
		name        string
		city        string
		state       string
	)

	sqlQuery := `SELECT * FROM products INNER JOIN stores ON products.store_id=stores.user_id WHERE product_id = ` + "'" + c.Params("id") + "'"
	err = db.QueryRow(sqlQuery).Scan(&product_id, &store_id, &title, &description, &category, pq.Array(&images), &created_at, &user_id, &name, &city, &state)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't retrieve product", "data": err.Error()})
	}

	return c.JSON(fiber.Map{"product_id": product_id, "store_id": store_id, "title": title, "description": description, "category": category, "images": images, "created_at": created_at, "store_name": name, "store_city": city, "store_state": state})
}

func UploadImage(c *fiber.Ctx) error {
	// TODO: Add image compression with ffmpeg
	// Parse image file
	file, err := c.FormFile("image")
	if err != nil {
		// log.Println("image upload error --> ", err)
		return c.JSON(fiber.Map{"status": 500, "message": "Server error. Could not get image", "data": nil})

	}

	// Convert file size from Bytes to KB
	// fileSize := float64(file.Size) / 1000

	// Get image extension from the image file
	fileExt := strings.Split(file.Filename, ".")[1]

	// Generate uuid for image filename
	uuid := uuid.New()

	// Create image using uuid and fileExt
	image := fmt.Sprintf("%s.%s", uuid, fileExt)

	// Save image to static images/product folder
	err = c.SaveFile(file, fmt.Sprintf("/secondDisk/FoodieMakers/images/products/%s", image)) // the path to the .../images folder should be different in a docker container so it is better to change the path to a modifiable env variable
	if err != nil {
		// log.Println("image save error --> ", err)
		return c.JSON(fiber.Map{"status": 500, "message": "Could not save image", "data": nil})
	}

	// Return image url
	imageUrl := fmt.Sprintf("https://api.foodiemakers.xyz/images/products/%s", image)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"image_url": imageUrl})
}
