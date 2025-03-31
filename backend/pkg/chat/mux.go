package chat

import (
	"database/sql"
	"net/http"
	"time"

	"social-network/pkg/auth"
)

func CreateChatMux(db *sql.DB) http.Handler {
	mux := http.NewServeMux()
	// mux.Handle("POST /chat", auth.Middleware(db, 1, 1, time.Millisecond, CreateComment))
	mux.Handle("GET /GetChaters", auth.Middleware(db, 150, 150, time.Millisecond, GetChaters))
	mux.Handle("GET /get_messages", auth.Middleware(db, 150, 150, time.Millisecond, GetMessages))
	mux.Handle("GET /get_chat_grp", auth.Middleware(db, 150, 150, time.Millisecond, GetChat))
	mux.Handle("POST /mark_as_seen", auth.Middleware(db, 1, 1, 20*time.Millisecond, MarkAsSeen))
	return mux
}
