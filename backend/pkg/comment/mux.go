package comments

import (
	"database/sql"
	"net/http"

	"social-network/pkg/auth"
)

func CreateCommentsMux(db *sql.DB, limiters *auth.Limiters) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("POST /comments", auth.Middleware(db, limiters, CreateComment))
	mux.Handle("GET /comments", auth.Middleware(db, limiters, GetComments))
	return mux
}
