package handler

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Product does not exist or it is not owned by current user", "data": err.Error()})
	}

	// Delete old images in case there are new ones in the request.
	if len(update_product.Images) > 0 {
		type OldImages struct {
			Images []string `json:"old_images" validate:"max=10,min=0"`
		}
		old_images := new(OldImages)
		err := validator.InputValidator(old_images, c)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation error", "data": err.Error()})
		}

		// Delete image files from the directory that is being used to serve static image files.
		for _, element := range old_images.Images {
			filePath := fmt.Sprintf("/secondDisk/FoodieMakers/images/products/%s", element)
			err = os.Remove(filePath)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't remove old image", "data": err.Error()})
			}
		}
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
		product_id      string
		store_id        string
		title           string
		description     string
		category        string
		images          []string
		created_at      string
		user_id         string
		name            string
		city            string
		state           string
		payment_methods []string
		rating          float32
		reviews_count   int32
	)

	sqlQuery := `
	SELECT 
		products.product_id, 
		products.store_id, 
		products.title, 
		products.description, 
		products.category, 
		products.images, 
		products.created_at, 
		stores.user_id, 
		stores.name, 
		stores.city, 
		stores.state,
		stores.payment_methods,
		ROUND(AVG(reviews.rating),2),
		COUNT(reviews.rating)
	FROM 
		products 
		INNER JOIN stores ON products.store_id = stores.user_id 
		LEFT JOIN reviews ON products.product_id = reviews.product_id 
	WHERE 
		products.product_id = $1
	GROUP BY 
		products.product_id, 
		stores.user_id`

	err = db.QueryRow(sqlQuery, c.Params("id")).Scan(&product_id, &store_id, &title, &description, &category, pq.Array(&images), &created_at, &user_id, &name, &city, &state, pq.Array(&payment_methods), &rating, &reviews_count)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't retrieve product", "data": err.Error()})
	}

	return c.JSON(fiber.Map{"product_id": product_id, "store_id": store_id, "title": title, "description": description, "category": category, "images": images, "created_at": created_at, "store_name": name, "store_city": city, "store_state": state, "payment_methods": payment_methods, "rating": rating, "reviews_count": reviews_count})
}

func ProductReviews(c *fiber.Ctx) error {
	offset, err := strconv.Atoi(c.Query("offset"))
	if err != nil {
		offset = int(0)
	}

	user_id := c.Query("user_id")

	// Get reviews from database matching product id from params.
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err.Error()})
	}

	type M map[string]interface{}

	var (
		review_id       string
		title           string
		content         string
		rating          float32
		product_id      string
		author_id       string
		created_at      time.Time
		reviewsMapSlice []M
		reviews_count   int32
		userHasReview   bool // default false
	)

	// Get the requested product total amount of reviews.
	err = db.QueryRow("SELECT COUNT(product_id) FROM reviews WHERE product_id=$1", c.Params("id")).Scan(&reviews_count)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't get reviews", "data": err.Error()})
	}

	// Check if current user already has a review in the requested product.
	err = db.QueryRow("SELECT review_id FROM reviews WHERE author_id=$1", user_id).Scan(&review_id)
	if err == nil { // If there are not errors the user already reviewed the product
		userHasReview = true
	}

	// Select data of all reviews belonging to the requested product.
	sqlQuery := "SELECT review_id, title, content, rating, product_id, author_id, created_at FROM reviews WHERE product_id=$1 LIMIT $2 OFFSET $3"
	rows, err := db.Query(sqlQuery, c.Params("id"), 2, offset)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't get reviews", "data": err.Error()})
	}
	defer rows.Close()
	for rows.Next() {
		err = rows.Scan(&review_id, &title, &content, &rating, &product_id, &author_id, &created_at)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't get reviews", "data": err.Error()})
		}

		elapsedTime := config.GetElapsedTime(created_at)

		review := M{"review_id": review_id, "title": title, "content": content, "rating": rating, "author_id": author_id, "elapsed_time": elapsedTime}

		reviewsMapSlice = append(reviewsMapSlice, review)
	}

	// get any error encountered during iteration
	err = rows.Err()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't get reviews", "data": err.Error()})
	}

	// Close connection to DB. Just in case
	rows.Close()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"reviews": reviewsMapSlice, "reviews_count": reviews_count, "user_has_review": userHasReview})
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
