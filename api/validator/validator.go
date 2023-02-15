package validator

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

func InputValidator(model interface{}, c *fiber.Ctx) error {

	// Parse body from POST request
	if err := c.BodyParser(model); err != nil {
		return err
	}

	// Validate body against passed Struct
	validate := validator.New()
	err := validate.Struct(model)
	if err != nil {
		if _, ok := err.(*validator.InvalidValidationError); ok {
			return err
		}

		return err
	}

	return nil
}
