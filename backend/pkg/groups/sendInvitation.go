package groups

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func SendInvitation(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var Groups models.Groups
	err := json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
	err = InsertInvitation(&Groups, userId, db, r)
	if err != nil {
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
}

func InsertInvitation(Group *models.Groups, userId int, Db *sql.DB, r *http.Request) error {
	return Db.QueryRow("INSERT INTO group_members (group_id, user_id, accepted) VALUES (?, ?, 0)", Group.Id, userId).Err()
}
