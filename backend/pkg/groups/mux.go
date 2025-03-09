package groups

import (
	"database/sql"
	"net/http"
	"time"

	"social-network/pkg/auth"
)

func CreateGroupsMux(db *sql.DB) http.Handler {
	mux := http.NewServeMux()
	// Create group
	mux.Handle("POST /", auth.Middleware(db, 1, 1, time.Millisecond, CreateGroup))
	// Get groups
	mux.Handle("GET /", auth.Middleware(db, 100, 150, time.Second, GetGroups))
	// Refuse invitation
	mux.Handle("DELETE /invitation", auth.Middleware(db, 1, 1, time.Second, RefuseInvitation))
	// Accept invitation
	mux.Handle("PUT /invitation", auth.Middleware(db, 10, 20, time.Second, AcceptInvitation))
	// Send invitation to join group
	mux.Handle("POST /invitation", auth.Middleware(db, 1, 1, 20*time.Millisecond, SendInvitation))

	return mux
}
