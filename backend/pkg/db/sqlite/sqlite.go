package database

import (
	"database/sql"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func Open() *sql.DB {
	// dbPath := os.Getenv("DB_PATH")
	dbPath := "./pkg/db/social-network.db"
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalln(err)
	}
	err = runMigrations(db)
	if err != nil {
		log.Fatalln(err)
	}
	return db
}

func runMigrations(db *sql.DB) error {
	driver, err := sqlite.WithInstance(db, &sqlite.Config{})
	if err != nil {
		return err
	}
	m, err := migrate.NewWithDatabaseInstance("file://./pkg/db/migrations/sqlite", "sqlite3", driver)
	if err != nil {
		return err
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}
	return nil
}
