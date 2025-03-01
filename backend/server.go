package main

import (
	"fmt"
	"log"
	"net/http"

	"social-network/pkg/auth"
	database "social-network/pkg/db/sqlite"

	_ "github.com/mattn/go-sqlite3"
)

func EnableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight (OPTIONS) requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	db := database.Open()
	limiters := auth.Limiters{}

	// Create Auth Router
	authMux := auth.CreateAuthMux(db, &limiters)

	// Apply CORS middleware to auth routes
	authHandler := EnableCORS(authMux)

	// Main router
	mainMux := http.NewServeMux()
	mainMux.Handle("/api/auth/", http.StripPrefix("/api/auth", authHandler))

	// Start Server
	fmt.Println("\033[42mServer is running on port 8080\033[0m")
	log.Fatalln(http.ListenAndServe("0.0.0.0:8080", mainMux))
}
