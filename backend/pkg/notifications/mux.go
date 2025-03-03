package notifications

import (
	"database/sql"
	"net/http"

	"social-network/pkg/auth"
)

func Mux(db *sql.DB, limiters *auth.Limiters) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", auth.Middleware(db, limiters, GetNotifications))
	mux.HandleFunc("seen", auth.Middleware(db, limiters, MarkAsSeen))
	return mux
}
