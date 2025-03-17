package users

import (
	"database/sql"
	"net/http"
	"time"

	"social-network/pkg/auth"
	"social-network/pkg/users/followers"
	"social-network/pkg/users/users"
)

func CreateUsersMux(db *sql.DB) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/profile", auth.Middleware(db, 10, 20, time.Second, users.Profile))
	mux.Handle("POST /EditProfile", auth.Middleware(db, 10, 20, time.Second, users.EditProfile))
	mux.Handle("GET /GetAllUsers", auth.Middleware(db, 10, 20, time.Second, GetAllUsers))
	mux.Handle("POST /follow", auth.Middleware(db, 10, 20, time.Second, followers.Follow))
	mux.Handle("DELETE /follow", auth.Middleware(db, 10, 20, time.Second, followers.Unfollow))
	mux.Handle("PUT /follow", auth.Middleware(db, 10, 20, time.Second, followers.AcceptFollow))
	mux.Handle("GET /followers", auth.Middleware(db, 10, 20, time.Second, followers.GetFollowers))
	mux.Handle("GET /following", auth.Middleware(db, 10, 20, time.Second, followers.GetFollowing))
	mux.Handle("GET /users", auth.Middleware(db, 10, 20, time.Second, users.GetUsers))
	return mux
}
