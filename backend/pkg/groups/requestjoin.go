package groups

import (
	"database/sql"
	"fmt"
	"net/http"
	"social-network/pkg/models"
	"social-network/pkg/notifications"
	"social-network/pkg/utils"
	"strconv"
)

func Requestjoin(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	groupId, err := strconv.Atoi(r.URL.Query().Get("group_id"))
	if err != nil || groupId <= 0 {
		fmt.Printf("\033[31mInvalid group ID: %v\033[0m\n", r.URL.Query().Get("group_id"))
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		fmt.Printf("\033[31mError starting transaction: %v\033[0m\n", err)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	query := `INSERT INTO group_members (group_id, user_id)
		SELECT $1, $2
		WHERE NOT EXISTS (
			SELECT 1 FROM groups
			WHERE id = $1 AND admin_id = $2
		)
		RETURNING id`

	var referenceId int
	err = tx.QueryRow(query, groupId, userId).Scan(&referenceId)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Printf("\033[31mUser %v is the admin of group %v or already a member\033[0m\n", userId, groupId)
			tx.Rollback()
			utils.WriteJSON(w, 400, "you are the admin of this group or already a member")
			return
		}
		fmt.Printf("\033[31mError executing query: %v\033[0m\n", err)
		tx.Rollback()
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	adminQuery := `SELECT admin_id FROM groups WHERE id = $1`
	var receiverId int
	err = tx.QueryRow(adminQuery, groupId).Scan(&receiverId)
	if err != nil {
		fmt.Printf("\033[31mError getting admin ID: %v\033[0m\n", err)
		tx.Rollback()
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	getGroupDataQuery := `SELECT id, name FROM groups WHERE id = $1`
	var groupData models.Group
	err = tx.QueryRow(getGroupDataQuery, groupId).Scan(&groupData.Id, &groupData.Name)
	if err != nil {
		fmt.Printf("\033[31mError getting group data: %v\033[0m\n", err)
		tx.Rollback()
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	notifications.SendNotification(tx, db, userId, receiverId, "request_join_group", referenceId, map[string]any{
		"group_id":   groupData.Id,
		"group_name": groupData.Name,
	})

	err = tx.Commit()
	if err != nil {
		fmt.Printf("\033[31mError committing transaction: %v\033[0m\n", err)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	utils.WriteJSON(w, 200, "join request sent")
}
