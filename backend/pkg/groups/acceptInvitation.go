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
		fmt.Printf("\033[31mError starting transaction: %v\033[0m\n", err)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	invitation := GroupInvitation{}
	err = json.NewDecoder(r.Body).Decode(&invitation)
	if err != nil {
		fmt.Printf("\033[31mError decoding request: %v\033[0m\n", err)
		utils.WriteJSON(w, 400, "bad request")
		return
	}

	var query string
	if invitation.Type == "request_join_group" {
		query = `UPDATE group_members 
		SET accepted = 1 
		WHERE id = ? AND EXISTS (
			SELECT 1 FROM groups 
			WHERE groups.id = group_members.group_id 
			AND groups.admin_id = ?
		)`
	} else if invitation.Type == "group_invitation" {
		query = `UPDATE group_members SET accepted = 1 WHERE id = ? AND user_id = ?`
	} else {
		utils.WriteJSON(w, 400, "bad request")
		return
	}

	_, err = tx.Exec(query, invitation.ReferenceId, userId)
	if err != nil {
		fmt.Printf("\033[31mError executing update: %v\033[0m\n", err)
		tx.Rollback()
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	query = `DELETE FROM notifications WHERE reference_id = ? AND type = ?`
	result, err := tx.Exec(query, invitation.ReferenceId, invitation.Type)
	if err != nil {
		fmt.Printf("\033[31mError deleting notification: %v\033[0m\n", err)
		tx.Rollback()
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		fmt.Printf("\033[31mError getting rows affected: %v\033[0m\n", err)
		tx.Rollback()
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
	if rowsAffected == 0 {
		fmt.Printf("\033[31mNo notification found for reference_id: %d and type: %s\033[0m\n", invitation.ReferenceId, invitation.Type)
		tx.Rollback()
		utils.WriteJSON(w, 404, "not found")
		return
	}

	err = tx.Commit()
	if err != nil {
		fmt.Printf("\033[31mError committing transaction: %v\033[0m\n", err)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	utils.WriteJSON(w, 200, "ok")
}
