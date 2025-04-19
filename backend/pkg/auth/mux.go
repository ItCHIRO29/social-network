package auth

import (
	"database/sql"
	"net/http"
)

func CreateAuthMux(db *sql.DB) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("POST /login", Login(db))
	mux.HandleFunc("POST /register", Register(db))
	mux.Handle("POST /logout", Logout(db))
	mux.HandleFunc("GET /verify", func(w http.ResponseWriter, r *http.Request) {
		sessionToken := r.Header.Get("Authorization")
		Verify(w, r, db, sessionToken)
	})
	// mux.HandleFunc("/logout", logout(db, limiters))
	return mux
}
