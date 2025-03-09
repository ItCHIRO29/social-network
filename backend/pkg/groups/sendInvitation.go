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
	err := json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
	// err = InsertInvitation(&Groups, userId, db, r)
	_, err1 := db.Exec("INSERT INTO group_members (user_id, group_id , accepted) VALUES (?, ?, 0)", userId, Groups.Id)
	if err1 != nil {
		fmt.Println("Error sending invitation: ", err)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
	fmt.Println("Invitation sent : ", Groups)
}
