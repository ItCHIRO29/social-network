package auth

import (
	"database/sql"
	"net/http"
)

func CreateAuthMux(db *sql.DB, limiters *Limiters) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/profile", Profile(db))
	// mux.HandleFunc("POST /register", Register(db))
	// mux.HandleFunc("/logout", logout(db, limiters))
	return mux
}
