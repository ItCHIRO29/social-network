package posts

import (
	"database/sql"
	"net/http"

	"social-network/pkg/auth"
)

func CreatePostsMux(db *sql.DB, limiters *auth.Limiters) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/createPost", auth.Middleware(db, limiters, CreatePost))
	mux.Handle("/getPosts", auth.Middleware(db, limiters, GetPosts))
	return mux
}
