package groups

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetVotes(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var Groups models.Event_members
	err := json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
	rows, err := db.Query("SELECT vm.id, vm.user_id, vm.event_id, vm.going , u.username, e.group_id FROM event_members vm JOIN events e on vm.event_id = e.id JOIN users u on vm.user_id = u.id WHERE vm.event_id = ?", Groups.EventID)
	if err != nil {
		http.Error(w, "internal server error", 500)
		return
	}
	defer rows.Close()

	var votes []models.Event_members
	for rows.Next() {
		var vote models.Event_members
		err = rows.Scan(&vote.ID, &vote.UserID, &vote.EventID, &vote.Going, &vote.UserName, &vote.Group_id)
		if err != nil {
			http.Error(w, "internal server error", 500)
			return
		}
		votes = append(votes, vote)
	}
	utils.WriteJSON(w, 200, votes)
}
