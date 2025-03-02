package posts

import (
	"database/sql"
	"net/http"

	"social-network/pkg/auth"
)

func CreatePostsMux(db *sql.DB, limiters *auth.Limiters) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("POST /posts", auth.Middleware(db, limiters, CreatePost))
	mux.Handle("GET /posts", auth.Middleware(db, limiters, GetPosts))

	return mux
}
