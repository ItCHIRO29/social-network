package groups

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"social-network/pkg/notifications"
	"social-network/pkg/utils"
)

type Invitation struct {
	GroupId int    `json:"group_id"`
	Type    string `json:"type"`
	Sender  string `json:"sender"`
}

func RefuseInvitation(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var invitation Invitation
	err := json.NewDecoder(r.Body).Decode(&invitation)
	if err != nil {
		fmt.Println("\033[34mError decoding request:", err, "\033[0m")
		utils.WriteJSON(w, 400, "bad request")
		return
	}

	if invitation.GroupId <= 0 || (invitation.Type != "group_invitation" && invitation.Type != "request_join_group") {
		fmt.Println("\033[34mInvalid invitation data:", invitation, "\033[0m")
		utils.WriteJSON(w, 400, "bad request")
		return
	}

	tx, err := db.Begin()
	if err != nil {
		fmt.Println("\033[34mError starting transaction:", err, "\033[0m")
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	var id int

	if invitation.Type == "request_join_group" {
		id, err = DeleteRequestJoinGroup(tx, invitation.GroupId, invitation.Sender)
		if err != nil {
			fmt.Println("\033[34mError deleting request join:", err, "\033[0m")
			tx.Rollback()
			utils.WriteJSON(w, 500, "internal server error")
			return
		}
	} else {
		id, err = DeleteInvitation(tx, invitation.GroupId, userId)
		if err != nil {
			fmt.Println("\033[34mError deleting invitation:", err, "\033[0m")
			tx.Rollback()
			utils.WriteJSON(w, 500, "internal server error")
			return
		}
	}

	if id == 0 {
		fmt.Println("\033[34mNo record found to delete:", invitation, "\033[0m")
		utils.WriteJSON(w, 400, "bad request")
		return
	}

	err = notifications.DeleteNotification(tx, id, invitation.Type)
	if err != nil {
		fmt.Println("\033[34mError deleting notification:", err, "\033[0m")
		tx.Rollback()
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	err = tx.Commit()
	if err != nil {
		fmt.Println("\033[34mError committing transaction:", err, "\033[0m")
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	w.WriteHeader(http.StatusOK)
}

func DeleteInvitation(tx *sql.Tx, groupId int, userId int) (int, error) {
	var id int
	err := tx.QueryRow("DELETE FROM group_members WHERE group_id = ? AND user_id = ? RETURNING id", groupId, userId).Scan(&id)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	return id, err
}

func DeleteRequestJoinGroup(tx *sql.Tx, groupId int, username string) (int, error) {
	var id int
	err := tx.QueryRow(`
		DELETE FROM group_members 
		WHERE group_id = ? AND user_id = (
			SELECT id FROM users WHERE username = ?
		) 
		RETURNING id`,
		groupId, username).Scan(&id)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	return id, err
}
