package groups

import (
	"database/sql"
	"fmt"
	"net/http"
	"social-network/pkg/notifications"
	"social-network/pkg/utils"
	"strconv"
)

func Requestjoin(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Printf("\033[32mStarting join request for user %v\033[0m\n", userId)

	groupId, err := strconv.Atoi(r.URL.Query().Get("group_id"))
	if err != nil || groupId <= 0 {
		fmt.Printf("\033[31mInvalid group ID: %v\033[0m\n", r.URL.Query().Get("group_id"))
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}
	fmt.Printf("\033[32mRequesting to join group %v\033[0m\n", groupId)

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

	fmt.Printf("\033[32mExecuting query: %v\033[0m\n", query)
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
	fmt.Printf("\033[32mGetting admin ID with query: %v\033[0m\n", adminQuery)
	var receiverId int
	err = tx.QueryRow(adminQuery, groupId).Scan(&receiverId)
	if err != nil {
		fmt.Printf("\033[31mError getting admin ID: %v\033[0m\n", err)
		tx.Rollback()
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	fmt.Printf("\033[32mCreated group_member with ID: %v\033[0m\n", referenceId)
	fmt.Printf("\033[32mGroup admin ID: %v\033[0m\n", receiverId)

	notifications.SendNotification(tx, db, userId, receiverId, "request_join_group", referenceId)
	fmt.Printf("\033[32mSent notification to admin %v\033[0m\n", receiverId)

	err = tx.Commit()
	if err != nil {
		fmt.Printf("\033[31mError committing transaction: %v\033[0m\n", err)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}

	fmt.Printf("\033[32mSuccessfully completed join request\033[0m\n")
	utils.WriteJSON(w, 200, "join request sent")
}
