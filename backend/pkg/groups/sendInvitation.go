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
	fmt.Println("Received request to send invitation")
	// Decode the request body
	err := json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		fmt.Println("Error decoding request body:", err)
		utils.WriteJSON(w, 400, "Bad request: Invalid JSON")
		return
	}
	fmt.Println("Received request to send invitation", Groups)
	// Check if the user is already a member or invited
	var existingID int
	query := `SELECT user_id FROM group_members WHERE user_id = ? AND group_id = ?`
	err = db.QueryRow(query, userId, Groups.Id).Scan(&existingID)

	if err == nil {
		fmt.Println("User is already a member or has a pending invitation.")
		utils.WriteJSON(w, 400, "User already invited or in group")
		return
	} else if err != sql.ErrNoRows {
		fmt.Println("Database error when checking existing invitation:", err)
		utils.WriteJSON(w, 500, "Internal server error")
		return
	}

	// If user is not in the group, insert new invitation
	_, err = db.Exec("INSERT INTO group_members (user_id, group_id, accepted) VALUES (?, ?, 0)", userId, Groups.Id)
	if err != nil {
		fmt.Println("Error sending invitation:", err)
		utils.WriteJSON(w, 500, "Internal server error")
		return
	}

	fmt.Println("Invitation sent successfully to user:", userId, "for group:", Groups.Id)
	utils.WriteJSON(w, 200, Groups)
}
