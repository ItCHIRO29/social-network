package notifications

import (
	"database/sql"
	"net/http"

	"social-network/pkg/auth"
)

func CreateNotificationsMux(db *sql.DB, limiters *auth.Limiters) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", auth.Middleware(db, limiters, GetNotifications))
	mux.HandleFunc("PUT /seen", auth.Middleware(db, limiters, MarkAsSeen))
	return mux
}
