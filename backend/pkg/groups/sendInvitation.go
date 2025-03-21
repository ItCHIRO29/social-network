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
	var Groups models.Groups
	// var existingMembers bool
	fmt.Println("Received request to send invitation")
	// Decode the request body
	err := json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		fmt.Println("Error decoding request body:", err)
		utils.WriteJSON(w, 400, "Bad request: Invalid JSON")
		return
	}
	fmt.Println("Received structure:", Groups)
	existingMembers, err := CheckExistingInvitation(db, Groups.Invited_user_id, Groups.Id)
	if err != nil {
		fmt.Println("Error checking existing members:", err)
		utils.WriteJSON(w, 500, "Internal server error")
		return
	}
	if existingMembers {
		fmt.Println("User already exists in the group")
		utils.WriteJSON(w, 400, "User already exists in the group")
		return
	}
	// if Groups.Invited_user_id != 0 && Groups.Invited_user_id != userId {
	// 	fmt.Println("user ID ===>", Groups)
	// 	// return
	// }

	if Groups.Invited_user_id != 0 && Groups.Invited_user_id != userId && !existingMembers {
		_, err = db.Exec("INSERT INTO group_members (user_id, group_id, accepted) VALUES (?, ?, 0)", Groups.Invited_user_id, Groups.Id)
		if err != nil {
			fmt.Println("Error sending invitation:", err)
			utils.WriteJSON(w, 500, "Internal server error")
			return
		}
		return
	}
	// If user is not in the group, insert new invitation
	_, err = db.Exec("INSERT INTO group_members (user_id, group_id, accepted) VALUES (?, ?, 0)", userId, Groups.Id)
	if err != nil {
		fmt.Println("Error sending invitation:", err)
		utils.WriteJSON(w, 500, "Internal server error")
		return
	}

	fmt.Println("Invitation sent successfully to user:", Groups.Invited_user_id, "for group:", Groups.Id)
	utils.WriteJSON(w, 200, Groups)
}

func CheckExistingInvitation(db *sql.DB, userId int, groupId int) (bool, error) {
	// Check if the user is already a member or invited
	var existingID int
	query := `SELECT user_id FROM group_members WHERE user_id = ? AND group_id = ?`
	err := db.QueryRow(query, userId, groupId).Scan(&existingID)
	if err == nil {
		fmt.Println("userId that is in group :", existingID)
		fmt.Println("userId that is in group :", userId)
		fmt.Println("User is already a member or has a pending invitation.")
		return true, err
	} else if err != sql.ErrNoRows {
		fmt.Println("Database error when checking existing invitation:", err)
		// utils.WriteJSON(w, 500, "Internal server error")
		return true, err
	}
	return false, nil
}
