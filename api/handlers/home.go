package handler

import (
	"log"

	"github.com/JoaquinOlivero/FoodieMakers/config"
	"github.com/gofiber/fiber/v2"
	"github.com/lib/pq"
)

func Home(c *fiber.Ctx) error {
	type Product struct {
		Id           string
		Title        string
		Images       []string
		Rating       float64
		ReviewsCount int32
		Category     string
	}

	var products []Product

	// Get products from database.
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err.Error()})
	}

	// Featured products

	// Top products per category
	sqlQuery := `
	SELECT 
    	products.product_id, products.title, products.images, categories.name, ROUND(AVG(reviews.rating),2) as average_rating, COUNT(reviews.rating) as total_reviews
	FROM 
		products
	JOIN
		categories ON $1 = categories.id
	JOIN 
		reviews ON products.product_id = reviews.product_id
	WHERE
		products.category_id = $1
	GROUP BY 
		products.product_id, categories.name
	ORDER BY 
		average_rating DESC
	LIMIT 5
	`

	for i := 0; i <= 10; i++ {
		rows, err := db.Query(sqlQuery, i)
		if err != nil {
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var product Product

			err := rows.Scan(&product.Id, &product.Title, pq.Array(&product.Images), &product.Category, &product.Rating, &product.ReviewsCount)
			if err != nil {
				log.Println(err)
			}

			products = append(products, product)
		}

		// get any error encountered during iteration
		err = rows.Err()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't get products", "data": err.Error()})
		}

		rows.Close()
	}

	return c.Status(fiber.StatusOK).JSON(products)
}
