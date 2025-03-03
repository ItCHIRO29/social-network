package users

import (
	"database/sql"
	"net/http"

	"social-network/pkg/auth"
)

func CreateUsersMux(db *sql.DB, limiters *auth.Limiters) http.Handler {
	mux := http.NewServeMux()
	// mux.Handle("/user_data", auth.Middleware(db, limiters, GetUserData))
	// mux.HandleFunc("POST /register", Register(db))
	// mux.HandleFunc("/logout", logout(db, limiters))
	return mux
}
