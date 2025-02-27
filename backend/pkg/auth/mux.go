package auth

import (
	"database/sql"
	"net/http"
)

func CreateAuthMux(db *sql.DB, limiters *Limiters) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/login", Login(db))
	// mux.HandleFunc("/register", register(db, limiters))
	// mux.HandleFunc("/logout", logout(db, limiters))
	return mux
}
