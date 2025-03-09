package groups

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func CreateGroup(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Println("in create group")
	var Groups models.Groups
	err := json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
	Groups.Admin, err = utils.GetUsernameFromId(db, userId)
	if err != nil {
		fmt.Println("error in get username in create group", err)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
	fmt.Println("in create group", Groups)
	// err = InsertNewGroup(&Groups, userId, db, r)
	if len(Groups.Name) < 3 || len(Groups.Name) > 15 {
		errors.New("invalid Name length")
		return
	} else if len(Groups.Description) < 1 || len(Groups.Description) > 500 {
		errors.New("invalid Description length")
		return
	}

	_, err = db.Exec("INSERT INTO groups (admin_id, name,description) VALUES (?, ?, ?)", userId, Groups.Name, Groups.Description)
	if err != nil {
		fmt.Println("in create group", err)
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
