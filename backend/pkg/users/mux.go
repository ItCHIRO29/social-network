package users

import (
	"database/sql"
	"net/http"

	"social-network/pkg/auth"
	"social-network/pkg/users/followers"
	"social-network/pkg/users/users"
)

func CreateUsersMux(db *sql.DB, limiters *auth.Limiters) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/profile", auth.Middleware(db, limiters, users.Profile))
	mux.Handle("POST /EditProfile", auth.Middleware(db, limiters, users.EditProfile))
	mux.Handle("GET /GetAllUsers", auth.Middleware(db, limiters, GetAllUsers))
	mux.Handle("POST /follow", auth.Middleware(db, limiters, followers.Follow))
	mux.Handle("DELETE /follow", auth.Middleware(db, limiters, followers.Unfollow))
	mux.Handle("PUT /follow", auth.Middleware(db, limiters, followers.AcceptFollow))
	return mux
}
