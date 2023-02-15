package model

// Review model
type Review struct {
	Title     string  `json:"review_title" validate:"required"`
	Content   string  `json:"review_content" validate:"required"`
	Rating    float32 `json:"review_rating" validate:"required"`
	ProductId string  `json:"review_product_id" validate:"required"`
	StoreId   string  `json:"review_store_id" validate:"required"`
}

// Delete Review Post Request Body
type DeleteReview struct {
	ReviewId  string `json:"review_id" validate:"required"`
	ProductId string `json:"review_product_id" validate:"required"`
}
