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
	mux.Handle("POST /create_group", auth.Middleware(db, 10, 20, time.Second, CreateGroup))
	// request to join
	mux.Handle("POST /join", auth.Middleware(db, 10, 20, time.Second, Requestjoin))
	// mux.Handle("DELETE /leave", auth.Middleware(db, 10, 20, time.Second, LeaveGrp))
	// Get members to invite
	mux.Handle("GET /get_members_to_invite", auth.Middleware(db, 10, 20, time.Second, GetMembersToInvite))
	// Get groups
	mux.Handle("GET /getGroups/all", auth.Middleware(db, 10, 20, time.Second, GetAllGroups))
	mux.Handle("GET /getGroups/MyGroups", auth.Middleware(db, 10, 20, time.Second, GetMyGroups))
	mux.Handle("GET /getGroups/joined", auth.Middleware(db, 10, 20, time.Second, GetJoinedGroups))
	mux.Handle("GET /getGroups/GroupsMember", auth.Middleware(db, 10, 20, time.Second, GetGroupsMember))
	// Get group activity TODO : fix later
	// mux.Handle("GET /getGroupActivity", auth.Middleware(db, 10, 20, time.Second, GetGroupActivity))
	// Refuse invitation
	mux.Handle("DELETE /invitation", auth.Middleware(db, 1, 1, time.Second, RefuseInvitation))
	// Accept invitation
	mux.Handle("PUT /invitation", auth.Middleware(db, 10, 20, time.Second, AcceptInvitation))
	// insert vote
	mux.Handle("POST /insert_vote", auth.Middleware(db, 20, 20, 20*time.Millisecond, InsertVote))
	// Send invitation to join group
	mux.Handle("POST /invitation", auth.Middleware(db, 1, 1, 20*time.Millisecond, SendInvitation))
	// Group page
	mux.Handle("GET /group", auth.Middleware(db, 10, 20, time.Second, groupPageHandler))

	return mux
}
