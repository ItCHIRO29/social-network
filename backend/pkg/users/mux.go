package users

import (
	"database/sql"
	"net/http"

	"social-network/pkg/auth"
)

func CreateUsersMux(db *sql.DB, limiters *auth.Limiters) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/profile", auth.Middleware(db, limiters, Profile))
	mux.Handle("POST /EditProfile", auth.Middleware(db, limiters, EditProfile))
	mux.Handle("/GetAllUsers", auth.Middleware(db, limiters, GetAllUsers))
	return mux
}
