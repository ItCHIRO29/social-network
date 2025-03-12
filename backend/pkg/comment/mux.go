package comments

import (
	"database/sql"
	"net/http"
	"time"

	"social-network/pkg/auth"
)

func CreateCommentsMux(db *sql.DB) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("POST /comment", auth.Middleware(db, 1, 1, time.Millisecond, CreateComment))
	mux.Handle("GET /comment", auth.Middleware(db, 150, 150, time.Millisecond, GetComments))
	return mux
}
