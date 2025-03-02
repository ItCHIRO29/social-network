package posts

import (
	"database/sql"
	"net/http"
	auth "social-network/pkg/auth"
)


func CreatePostMux(db *sql.DB, limiters *auth.Limiters) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("POST /CreatePost", CreatePost(db))
	mux.HandleFunc("POST /GetPosts", GetPosts(db))
	// mux.HandleFunc("/logout", logout(db, limiters))
	return mux
}
