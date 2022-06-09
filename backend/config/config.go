package config

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

// Config func to get env value
func Config(key string) string {
	// load .env file
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Print("Error loading .env file")
	}
	return os.Getenv(key)
}

// Func to connect to database.
func ConnectDB() (*sql.DB, error) {
	connStr := Config("POSTGRESQL_URL")      // Database connection string
	db, err := sql.Open("postgres", connStr) // Connect to database
	if err != nil {
		return db, err
	}
	if err = db.Ping(); err != nil {
		return db, err
	}
	return db, err

}
