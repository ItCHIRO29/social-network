package groups

import (
	"database/sql"
	"net/http"
	"social-network/pkg/utils"
)

func VoteEvent(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	eventId := r.URL.Query().Get("event_id")
	err := db.QueryRow("INSERT INTO event_votes (event_id, user_id) VALUES (?, ?)", eventId, userId).Err()
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
}
