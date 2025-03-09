package auth

import (
	"database/sql"
	"net/http"
)

func CreateAuthMux(db *sql.DB) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("POST /login", Login(db))
	mux.HandleFunc("POST /register", Register(db))
	// mux.Handle("POST /logout", Logout)
	// mux.HandleFunc("/logout", logout(db, limiters))
	return mux
}
