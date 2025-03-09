package posts

import (
	"database/sql"
	"net/http"
	"time"

	"social-network/pkg/auth"
)

func CreatePostsMux(db *sql.DB, limiters *auth.Limiters) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/createPost", auth.Middleware(db, 1, 1, 50*time.Millisecond, CreatePost))
	mux.Handle("/getPosts", auth.Middleware(db, 150, 150, time.Millisecond, GetPosts))
	return mux
}
