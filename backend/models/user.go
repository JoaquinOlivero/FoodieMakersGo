package model

// User model
type User struct {
	FirstName    string `json:"first_name" valid:"required"`
	LastName     string `json:"last_name" valid:"required"`
	Email        string `json:"email" valid:"email,required"`
	Password     string `json:"password" valid:"required,min=6,max=256"`
	RefreshToken string `json:"refresh_token"`
}

// Login model
type LoginInput struct {
	Email    string `json:"email" validate:"email,required"`
	Password string `json:"password" validate:"required,min=6,max=256"`
}

// Store model
type Store struct {
	Name  string `json:"store_name" validate:"required"`
	City  string `json:"store_city" validate:"required"`
	State string `json:"store_state" validate:"required"`
}
