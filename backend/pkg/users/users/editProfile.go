package users

import (
	"database/sql"
	"encoding/json"
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
		var NewData models.EditProfile
		var isPublic bool
		err := json.NewDecoder(r.Body).Decode(&NewData)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
			return
		}
		if NewData.Username == "" || NewData.Email == "" {
			utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Username and email are required"})
			return
		}
		// fmt.Println("NewData:", NewData)
		stmt, err := db.Prepare("UPDATE users SET username = ?, email = ?, public = ? WHERE id = ?")
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update user"})
			return
		}
		defer stmt.Close()
		if NewData.Public == "private" {
			isPublic = false
		} else {
			isPublic = true
		}
		_, err = stmt.Exec(NewData.Username, NewData.Email, isPublic, userID)
		if err != nil {
			utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update user"})
			return
		}
	}
}
