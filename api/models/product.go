package model

// Product model
type Product struct {
	Title       string   `json:"product_title" validate:"required"`
	Description string   `json:"product_description" validate:"required"`
	Category    int      `json:"product_category" validate:"required"`
	Images      []string `json:"product_images" validate:"required,min=1,max=10"`
}

// Update product model
type UpdateProduct struct {
	ProductId   string   `json:"product_id" validate:"required"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Category    int      `json:"category_id"`
	Images      []string `json:"images" validate:"max=10,min=0"`
}

// Delete product model
type DeleteProduct struct {
	ProductId string `json:"product_id" validate:"required"`
}
