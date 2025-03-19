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
	mux.Handle("POST /createGroup", auth.Middleware(db, 10, 20, time.Second, CreateGroup))
	// Get groups
	mux.Handle("GET /getGroups/all", auth.Middleware(db, 10, 20, time.Second, GetAllGroups))
	mux.Handle("GET /getGroups/MyGroups", auth.Middleware(db, 10, 20, time.Second, GetMyGroups))
	// Get group activity
	mux.Handle("GET /getGroupActivity", auth.Middleware(db, 10, 20, time.Second, GetGroupActivity))
	// Refuse invitation
	mux.Handle("DELETE /invitation", auth.Middleware(db, 1, 1, time.Second, RefuseInvitation))
	// Accept invitation
	mux.Handle("PUT /invitation", auth.Middleware(db, 10, 20, time.Second, AcceptInvitation))
	// insert vote
	mux.Handle("POST /insertVote", auth.Middleware(db, 20, 20, 20*time.Millisecond, InsertVote))
	// Send invitation to join group
	mux.Handle("POST /invitation", auth.Middleware(db, 1, 1, 20*time.Millisecond, SendInvitation))

	return mux
}
