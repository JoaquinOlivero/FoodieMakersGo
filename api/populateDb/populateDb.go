package populateDb

import (
	"encoding/json"
	"log"
	"math/rand"
	"time"

	"github.com/JoaquinOlivero/FoodieMakers/config"
	"github.com/lib/pq"
)

var (
	description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
	review      = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Non quam lacus suspendisse faucibus interdum posuere lorem ipsum dolor. Ut consequat semper viverra nam libero justo laoreet sit amet. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Ac orci phasellus egestas tellus rutrum tellus pellentesque."
)

func AddReviews() error {
	log.Println("add reviews")
	// select all users from db
	var userIds []string
	db, err := config.ConnectDB()
	if err != nil {
		return err
	}

	sqlQuery := "SELECT id FROM users"
	rows, err := db.Query(sqlQuery)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var id string
		rows.Scan(&id)
		userIds = append(userIds, id)
	}

	rows.Close()

	// select all products listed.
	type Products struct {
		Id      string
		StoreId string
	}
	var products []Products
	sqlQuery = `
	SELECT
		products.product_id, products.store_id
	FROM 
		products
	LEFT JOIN 
		reviews ON products.product_id = reviews.product_id
	GROUP BY 
		products.product_id
	HAVING
		COUNT(reviews.rating) < 10
	`
	rows, err = db.Query(sqlQuery)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var id, storeId string
		var pr Products

		rows.Scan(&id, &storeId)

		pr.Id = id
		pr.StoreId = storeId
		products = append(products, pr)
	}

	rows.Close()

	for _, userId := range userIds {
		// Save review in database

		for _, product := range products {
			if userId != product.StoreId {
				rand.Seed(time.Now().UnixNano())
				// Generate a random number between 1 and 5
				rating := rand.Intn(5) + 1

				sqlQuery = `INSERT INTO reviews (title, content, rating, product_id, author_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING review_id`
				_, err := db.Exec(sqlQuery, "Lorem Ipsum", review, rating, product.Id, userId, time.Now())
				if err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func AddProducts() error {
	log.Println("add product")
	// select all users from db
	var ids []string
	db, err := config.ConnectDB()
	if err != nil {
		log.Println(err)
		return err
	}

	sqlQuery := "SELECT id FROM users"
	rows, err := db.Query(sqlQuery)
	if err != nil {
		log.Println(err)
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var id string
		rows.Scan(&id)
		ids = append(ids, id)
	}

	// insert products in db one by one
	images := []string{"f101f08e-32df-495c-bbe5-587d6f328846.jpg", "56fdcbab-15fa-430f-9ba3-b6d3c627a702.jpg", "5f8aa010-a7e6-4f9e-8251-3adf5eab9cae.jpg", "03578ea2-29e3-4f50-803d-fd21a2a96831.jpg", "a9100a4f-c78b-43b2-9f2b-24f9beb446d7.jpg"}
	pNames := `[{
		"products": "Cookies Cereal Nut"
	  }, {
		"products": "Juice - Apple Cider"
	  }, {
		"products": "Soup - Knorr, Classic Can. Chili"
	  }, {
		"products": "Pepper - Cubanelle"
	  }, {
		"products": "Pasta - Tortellini, Fresh"
	  }, {
		"products": "Appetizer - Asian Shrimp Roll"
	  }, {
		"products": "Extract - Vanilla,artificial"
	  }, {
		"products": "Coffee Beans - Chocolate"
	  }, {
		"products": "Wine - Niagara Peninsula Vqa"
	  }, {
		"products": "Crab - Back Fin Meat, Canned"
	  }, {
		"products": "Kaffir Lime Leaves"
	  }, {
		"products": "Bread - White, Sliced"
	  }, {
		"products": "Nacho Chips"
	  }, {
		"products": "Soup - Campbells"
	  }, {
		"products": "Bread - Dark Rye, Loaf"
	  }, {
		"products": "Hickory Smoke, Liquid"
	  }, {
		"products": "Cheese - Swiss"
	  }, {
		"products": "Chicken Thigh - Bone Out"
	  }, {
		"products": "Lamb - Whole, Fresh"
	  }, {
		"products": "Hickory Smoke, Liquid"
	  }, {
		"products": "Tuna - Sushi Grade"
	  }, {
		"products": "Hipnotiq Liquor"
	  }, {
		"products": "Wine - Zonnebloem Pinotage"
	  }, {
		"products": "Coffee - Colombian, Portioned"
	  }, {
		"products": "Salt - Sea"
	  }, {
		"products": "Neckerchief Blck"
	  }, {
		"products": "Wine - Pinot Noir Mondavi Coastal"
	  }, {
		"products": "Juice - Grapefruit, 341 Ml"
	  }, {
		"products": "V8 Splash Strawberry Banana"
	  }, {
		"products": "Bread - Triangle White"
	  }, {
		"products": "Coriander - Ground"
	  }, {
		"products": "Swiss Chard - Red"
	  }, {
		"products": "Sobe - Tropical Energy"
	  }, {
		"products": "Beef - Tenderlion, Center Cut"
	  }, {
		"products": "Foam Espresso Cup Plain White"
	  }, {
		"products": "Curry Paste - Green Masala"
	  }, {
		"products": "Cheese - La Sauvagine"
	  }, {
		"products": "Spaghetti Squash"
	  }, {
		"products": "Nestea - Iced Tea"
	  }, {
		"products": "Oil - Macadamia"
	  }]`

	type Product struct {
		Products string `json:"products"`
	}

	var products []Product
	err = json.Unmarshal([]byte(pNames), &products)
	if err != nil {
		log.Println(err)
	}

	// Extract the value of each "products" key into a slice of strings
	var productNames []string
	for _, product := range products {
		productNames = append(productNames, product.Products)
	}

	i := 0

	// Set the random seed based on the current time
	rand.Seed(time.Now().UnixNano())

	for _, id := range ids {

		if i < 40 {
			arrImg := []string{images[rand.Intn(4)+1]}
			sqlQuery = `INSERT INTO products (store_id, title, description, category_id, images, created_at) VALUES ($1, $2, $3, $4, $5, current_timestamp) RETURNING product_id`
			result, err := db.Exec(sqlQuery, id, productNames[i], description, rand.Intn(10)+1, pq.Array(arrImg))
			if err != nil {
				log.Println(err)
				return err
			}

			log.Println(result.RowsAffected())
		}
		i += 1

		if i < 40 {
			arrImg := []string{images[rand.Intn(4)+1]}
			sqlQuery = `INSERT INTO products (store_id, title, description, category_id, images, created_at) VALUES ($1, $2, $3, $4, $5, current_timestamp) RETURNING product_id`
			_, err := db.Exec(sqlQuery, id, productNames[i], description, rand.Intn(10)+1, pq.Array(arrImg))
			if err != nil {
				log.Println(err)
				return err
			}
		}
		i += 1

	}

	return nil
}
