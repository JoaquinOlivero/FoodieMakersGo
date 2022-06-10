package model

// Product model
type Product struct {
	Title       string   `json:"product_title" validate:"required"`
	Description string   `json:"product_description" validate:"required"`
	Category    string   `json:"product_category" validate:"required"`
	Images      []string `json:"product_images" validate:"required,max=10,min=1"`
}

// Update product model
type UpdateProduct struct {
	ProductId   string   `json:"product_id" validate:"required"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Images      []string `json:"images" validate:"max=10,min=0"`
}
