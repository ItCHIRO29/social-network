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
	fmt.Printf("\033[32mStarting invitation acceptance for user %v\033[0m\n", userId)

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
	fmt.Printf("\033[32mReceived invitation: ReferenceId=%v, Type=%v\033[0m\n", invitation.ReferenceId, invitation.Type)

	var query string
	if invitation.Type == "request_join_group" {
		query = `UPDATE group_members 
		SET accepted = 1 
		WHERE id = ? AND EXISTS (
			SELECT 1 FROM groups 
			WHERE groups.id = group_members.group_id 
			AND groups.admin_id = ?
		)`
		fmt.Printf("\033[32mProcessing request_join_group with query: %v\033[0m\n", query)
	} else if invitation.Type == "group_invitation" {
		query = `UPDATE group_members SET accepted = 1 WHERE id = ? AND user_id = ?`
		fmt.Printf("\033[32mProcessing group_invitation with query: %v\033[0m\n", query)
	} else {
		fmt.Printf("\033[31mInvalid invitation type: %v\033[0m\n", invitation.Type)
		utils.WriteJSON(w, 400, "bad request")
		return
	}

	result, err := tx.Exec(query, invitation.ReferenceId, userId)
	if err != nil {
		fmt.Printf("\033[31mError executing update: %v\033[0m\n", err)
		tx.Rollback()
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
	rowsAffected, _ := result.RowsAffected()
	fmt.Printf("\033[32mUpdated %v rows in group_members\033[0m\n", rowsAffected)

	query = `DELETE FROM notifications WHERE reference_id = ? AND type = ?`
	fmt.Printf("\033[32mDeleting notification with query: %v\033[0m\n", query)
	result, err = tx.Exec(query, invitation.ReferenceId, invitation.Type)
	if err != nil {
		fmt.Printf("\033[31mError deleting notification: %v\033[0m\n", err)
		tx.Rollback()
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
	rowsAffected, _ = result.RowsAffected()
	fmt.Printf("\033[32mDeleted %v notifications\033[0m\n", rowsAffected)

	err = tx.Commit()
	if err != nil {
		fmt.Printf("\033[31mError committing transaction: %v\033[0m\n", err)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	fmt.Printf("\033[32mSuccessfully completed invitation acceptance\033[0m\n")
	utils.WriteJSON(w, 200, "ok")
}
