package groups

import (
	"database/sql"
	"encoding/json"
	"encoding/json"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func AcceptInvitation(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var Groups models.Groups
	err := json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
	err = InvitationAccepted(&Groups, userId, db, r)
	if err != nil {
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
}

func InvitationAccepted(Group *models.Groups, userId int, Db *sql.DB, r *http.Request) error {
	return Db.QueryRow("UPDATE group_members SET accepted = 1 WHERE group_id = ? AND user_id = ?", Group.Id, userId).Err()
}
