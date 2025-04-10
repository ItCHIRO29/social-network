package groups

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/pkg/utils"
)

type GroupInvitation struct {
	ReferenceId int    `json:"reference_id"`
	Type        string `json:"type"` // group_invitation, request_join_group
}

func AcceptInvitation(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	tx, err := db.Begin()
	if err != nil {
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	invitation := GroupInvitation{}
	err = json.NewDecoder(r.Body).Decode(&invitation)
	if err != nil {
		fmt.Println(err)
		utils.WriteJSON(w, 400, "bad request")
		return
	}

	if (invitation.Type != "group_invitation" && invitation.Type != "request_join_group") || invitation.ReferenceId <= 0 {
		utils.WriteJSON(w, 400, "bad request: invalid invitation type or reference id")
		return
	}

	query := `UPDATE group_members SET accepted = 1 WHERE id = ? AND user_id = ?`
	_, err = tx.Exec(query, invitation.ReferenceId, userId)
	if err != nil {
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	query = `DELETE FROM notifications WHERE reference_id = ? AND type = ?`
	_, err = tx.Exec(query, invitation.ReferenceId, invitation.Type)
	if err != nil {
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	err = tx.Commit()
	if err != nil {
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	utils.WriteJSON(w, 200, "ok")
}
