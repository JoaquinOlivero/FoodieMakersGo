package config

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
)

// Config func to get env value
func Env(key string) string {
	// load .env file
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Print("Error loading .env file")
	}
	return os.Getenv(key)
}

// Func to connect to database.
func ConnectDB() (*sql.DB, error) {
	connStr := Env("POSTGRESQL_URL")         // Database connection string
	db, err := sql.Open("postgres", connStr) // Connect to database
	if err != nil {
		return db, err
	}
	if err = db.Ping(); err != nil {
		return db, err
	}
	return db, err

}

// Func to check when a product or review was posted. (1min ago, 1h ago, 1d ago, 1w ago, 1mo ago, 1y ago, etc...)
func GetElapsedTime(pastDate time.Time) string {
	dateNow := time.Now()
	difference := dateNow.Sub(pastDate) // dateNow - pastDate

	years := int64(difference.Hours() / 24 / 365)
	months := int64(difference.Hours() / 24 / 30)
	weeks := int64(difference.Hours() / 24 / 7)
	days := int64(difference.Hours() / 24)
	hours := difference.Hours()
	minutes := difference.Minutes()
	seconds := difference.Seconds()

	switch {
	case years != 0:
		elapsedTime := fmt.Sprintf("%dy ago", years)
		return elapsedTime
	case months != 0:
		elapsedTime := fmt.Sprintf("%dmo ago", months)
		return elapsedTime
	case weeks != 0:
		elapsedTime := fmt.Sprintf("%dw ago", weeks)
		return elapsedTime
	case days != 0:
		elapsedTime := fmt.Sprintf("%dd ago", days)
		return elapsedTime
	case hours > 0.59:
		elapsedTime := fmt.Sprintf("%.fh ago", hours)
		return elapsedTime
	case minutes != 0:
		elapsedTime := fmt.Sprintf("%.fmin ago", minutes)
		return elapsedTime
	case seconds != 0:
		elapsedTime := fmt.Sprintf("%.fs ago", seconds)
		return elapsedTime
	}

	return ""
}
