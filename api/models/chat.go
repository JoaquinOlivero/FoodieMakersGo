package model

// New Chat Model
type NewChat struct {
	StoreId string `json:"store_id" validate:"required"`
}
