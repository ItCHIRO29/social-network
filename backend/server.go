package main

import (
	"fmt"
	"log"
	"net/http"

	"social-network/pkg/auth"
	database "social-network/pkg/db/sqlite"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db := database.Open()
	limiters := auth.Limiters{}
	mainMux := http.NewServeMux()
	mainMux.Handle("/api/auth/", http.StripPrefix("/api/auth", auth.CreateAuthMux(db, &limiters)))

	fmt.Println("\033[42mServer is running on port 8080\033[0m")
	log.Fatalln(http.ListenAndServe("0.0.0.0:8080", mainMux))
}
