package groups

import (
	"database/sql"
	"net/http"

	"social-network/pkg/auth"
)

func CreateGroupsMux(db *sql.DB, limiters *auth.Limiters) http.Handler {
	mux := http.NewServeMux()
	// Create group
	mux.Handle("POST /", auth.Middleware(db, limiters, CreateGroup))
	// Get groups
	mux.Handle("GET /", auth.Middleware(db, limiters, GetGroups))
	// Refuse invitation
	mux.Handle("DELETE /invitation", auth.Middleware(db, limiters, RefuseInvitation))
	// Accept invitation
	mux.Handle("PUT /invitation", auth.Middleware(db, limiters, AcceptInvitation))
	// Send invitation to join group
	mux.Handle("POST /invitation", auth.Middleware(db, limiters, SendInvitation))

	return mux
}
