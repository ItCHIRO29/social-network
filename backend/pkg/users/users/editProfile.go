package users

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func EditProfile(w http.ResponseWriter, r *http.Request, db *sql.DB, userID int) {
	if r.Method == "POST" {
		// idstr := r.FormValue("id")
		// id, err := strconv.Atoi(idstr)
		// if err != nil {
		// 	utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
		// 	return
		// }
		// fmt.Println("EditProfile triggered!!!!!!!!!!!")
		// var NewData models.EditProfile
		var NewData models.EditProfile
		err := json.NewDecoder(r.Body).Decode(&NewData)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
			return
		}

		// fmt.Println("NewData:", NewData)
		stmt, err := db.Prepare("UPDATE users SET public = ? WHERE id = ?")
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update user"})
			return
		}
		stmt.Exec(!NewData.Public, userID)
		defer stmt.Close()
		fmt.Println(NewData.Public)
		utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "User updated successfully"})
	}
}
