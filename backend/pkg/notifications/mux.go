package notifications

import (
	"database/sql"
	"net/http"
	"time"

	"social-network/pkg/auth"
)

func CreateNotificationsMux(db *sql.DB) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /getNotifications", auth.Middleware(db, 150, 150, time.Second, GetNotifications))
	mux.HandleFunc("GET /count", auth.Middleware(db, 150, 150, time.Second, GetCount))
	mux.HandleFunc("PUT /seen", auth.Middleware(db, 1, 1, 20*time.Millisecond, MarkAsSeen))
	return mux
}
