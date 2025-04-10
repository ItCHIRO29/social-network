package groups

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func SendInvitation(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var group models.Group
	err := json.NewDecoder(r.Body).Decode(&group)
	if err != nil {
		fmt.Printf("\033[31mError: %v\033[0m\n", err)
		utils.WriteJSON(w, 400, "bad request")
		return
	}

	checkQuery := `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`
	var exists int
	err = db.QueryRow(checkQuery, group.Id, userId).Scan(&exists)
	if err != nil {
		fmt.Printf("\033[31mError: %v\033[0m\n", err)
		if err == sql.ErrNoRows {
			utils.WriteJSON(w, 400, "you must be a member of the group to invite others")
			return
		}
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	tx, err := db.Begin()
	if err != nil {
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	query := `INSERT INTO group_members (user_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`

	for _, invitedId := range group.InvitedUsers {
		_, err := tx.Exec(query, invitedId, group.Id)
		if err != nil {
			fmt.Printf("\033[31mError: %v\033[0m\n", err)
			tx.Rollback()
			utils.WriteJSON(w, 500, "internal server error")
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		fmt.Printf("\033[31mError: %v\033[0m\n", err)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	utils.WriteJSON(w, 200, "invitation sent")
}
