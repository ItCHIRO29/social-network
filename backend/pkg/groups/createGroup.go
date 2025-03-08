package groups

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func CreateGroup(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var Groups models.Groups
	err := json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
	err = InsertNewGroup(&Groups, userId, db, r)
	if err != nil {
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
}

func InsertNewGroup(Group *models.Groups, userId int, Db *sql.DB, r *http.Request) error {
	if len(Group.Name) < 3 || len(Group.Name) > 15 {
		return errors.New("invalid Name length")
	} else if len(Group.Description) < 1 || len(Group.Description) > 500 {
		return errors.New("invalid Description length")
	}

	return Db.QueryRow("INSERT INTO groups (admin_id, name,description) VALUES (?, ?, ?)", userId, Group.Name, Group.Description).Err()
}
