package middleware

import (
	"fmt"
	"io/ioutil"

	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v3"
	"github.com/golang-jwt/jwt/v4"
)

func Protected() fiber.Handler {
	// Read rsa public key
	publicKey, err := ioutil.ReadFile("jwt_rsa.pub")
	if err != nil {
		fmt.Println(err)
	}

	// Parse publick key
	key, err := jwt.ParseRSAPublicKeyFromPEM(publicKey)
	if err != nil {
		fmt.Println(err)
	}

	return jwtware.New(jwtware.Config{
		TokenLookup:   "cookie:data",
		SigningMethod: "RS256",
		SigningKey:    key,
		ErrorHandler:  jwtError,
	})
}

func jwtError(c *fiber.Ctx, err error) error {
	if err.Error() == "Missing or malformed JWT" {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"status": "error", "message": "Missing or malformed JWT", "data": nil})
	}
	return c.Status(fiber.StatusUnauthorized).
		JSON(fiber.Map{"status": "error", "message": "Invalid or expired JWT", "data": nil})
}
