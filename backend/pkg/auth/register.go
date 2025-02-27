package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func Register(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	userData := models.User{}
	err := json.NewDecoder(r.Body).Decode(&userData)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, "Bad Request")
		return
	}

	if err := IsValidRegisterForm(&userData, db); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	path, err := utils.ValidateAndSaveImage(r, "profile", userData.Username)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	fmt.Println(path)
}
