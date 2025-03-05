package groups

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func CreateGroup(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		utils.WriteJSON(w, http.StatusUnauthorized, struct {
			Error string `json:"error"`
		}{Error: "Unauthorized"})
		return
	}
	var Groups models.Groups
	err = json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
}

func InsertNewGroup(Group *models.Groups, sessionToken string, Db *sql.DB, r *http.Request) error {
	_, User_id, err := GetId(sessionToken, Db)
	if err != nil {
		return errors.New("user doesn't exist")
	} else if len(Group.Name) < 1 || len(Group.Name) > 10 {
		return errors.New("invalid Name length")
	} else if len(Group.Description) < 1 ||  len(Group.Description) > 500 {
		return errors.New("invalid Description length")
	}
	
	return Db.QueryRow("INSERT INTO groups (nadmin_id, name,description) VALUES (?, ?, ?)", Groups.name/* con*/,).Err()
}
