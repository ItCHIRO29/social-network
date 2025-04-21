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
	var NewData models.EditProfile
	err := json.NewDecoder(r.Body).Decode(&NewData)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	query := `UPDATE users SET public = ? WHERE id = ?`

	_, err = db.Exec(query, !NewData.Public, userID)
	if err != nil {
		fmt.Println("/////////", err)
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update profile"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Profile updated successfully"})
}
