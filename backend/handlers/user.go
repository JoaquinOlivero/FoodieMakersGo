package handler

import (
	"io/ioutil"
	"time"

	"github.com/JoaquinOlivero/FoodieMakers/config"
	model "github.com/JoaquinOlivero/FoodieMakers/models"
	"github.com/JoaquinOlivero/FoodieMakers/validator"
	"github.com/gofiber/fiber/v2"

	"github.com/golang-jwt/jwt/v4"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// Hash user password
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash compare password with hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Log user in
func LoginUser(c *fiber.Ctx) error {

	// Validate POST request body.
	input := new(model.LoginInput)
	err := validator.InputValidator(input, c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation error", "data": err.Error()})
	}

	// Get user from database with matching email
	var email string
	var hashPassword string
	var userId string
	var hasStore bool

	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err})
	}

	sqlQuery := `SELECT id ,email, password FROM users WHERE email=$1`
	row := db.QueryRow(sqlQuery, input.Email)
	if err := row.Scan(&userId, &email, &hashPassword); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't find email", "data": err})
	}
	// Check passwords
	if !CheckPasswordHash(input.Password, hashPassword) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid password", "data": nil})
	}
	// Check if user has a store
	sqlQuery = `SELECT user_id FROM stores WHERE user_id=$1`
	errStore := db.QueryRow(sqlQuery, userId).Scan(&userId)
	if errStore == nil {
		hasStore = true
	} else {
		hasStore = false
	}

	// JWT claims
	claims := jwt.MapClaims{
		"user_id":   userId,
		"has_store": hasStore,
		"email":     email,
		"exp":       time.Now().Add(time.Hour * 24).Unix(),
	}

	// Create RS256 JWT
	// Read rsa private key
	privateKey, err := ioutil.ReadFile("jwt.rsa")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't generate token", "data": err})
	}

	// Parse rsa private key
	key, err := jwt.ParseRSAPrivateKeyFromPEM(privateKey)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't generate token", "data": err})
	}

	// Create RS256 token
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	// Generate encrypted JWT
	rsaToken, err := token.SignedString(key)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't generate token", "data": err})
	}

	// Create cookie and send token
	cookie := new(fiber.Cookie)
	cookie.Name = "cookieToken"
	cookie.Value = rsaToken
	cookie.Expires = time.Now().Add(24 * time.Hour)
	cookie.Domain = "foodiemakers.xyz"
	cookie.Path = "/"
	cookie.HTTPOnly = true
	cookie.Secure = true
	cookie.SameSite = "Lax"

	// Set cookie
	c.Cookie(cookie)

	// Send user id back to use in react context api
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"user_id": userId, "has_store": hasStore})
}

// Check if jwt token is still valid and keep user signed in
func CheckToken(c *fiber.Ctx) error {

	// Get user id from middleware
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	user_id := claims["user_id"].(string)
	has_store := claims["has_store"]

	// Send user id back to use in react context api
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"user_id": user_id, "has_store": has_store})
}

// Register new user
func RegisterUser(c *fiber.Ctx) error {

	// Validate POST request body.
	user := new(model.User)
	err := validator.InputValidator(user, c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation error", "data": err.Error()})
	}

	// Hash password
	hash, err := hashPassword(user.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't hash password", "data": err})
	}
	user.Password = hash

	// Insert new registered user in the database
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err})
	}
	sqlQuery := `
	INSERT INTO users (first_name, last_name, email, password)
	VALUES ($1, $2, $3, $4)
	`
	_, err = db.Exec(sqlQuery, user.FirstName, user.LastName, user.Email, user.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Couldn't create user", "data": err})
	}
	return c.SendStatus(fiber.StatusOK)
}

// Create Store
func CreateStore(c *fiber.Ctx) error {

	// Validate POST request body.
	store := new(model.Store)
	err := validator.InputValidator(store, c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Validation error", "data": err.Error()})
	}

	// Get user id from middleware
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	user_id := claims["user_id"].(string)

	// Insert store in database with one to one relationship with user.
	db, err := config.ConnectDB()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Couldn't connect to database", "data": err})
	}

	sqlQuery := `INSERT INTO stores (user_id, name, city, state) VALUES ($1, $2, $3, $4)`
	_, err = db.Exec(sqlQuery, user_id, store.Name, store.City, store.State)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Couldn't create store", "data": err})
	}

	return c.SendStatus(fiber.StatusOK)
}

func LogoutUser(c *fiber.Ctx) error {

	// Expire specific cookie by name:
	c.Cookie(&fiber.Cookie{
		Name: "cookieToken",
		// Set expiry date to the past
		Expires:  time.Now().Add(-(time.Hour * 2)),
		Domain:   "foodiemakers.xyz",
		Path:     "/",
		HTTPOnly: true,
		Secure:   true,
		SameSite: "lax",
	})

	return c.SendStatus(fiber.StatusOK)
}
