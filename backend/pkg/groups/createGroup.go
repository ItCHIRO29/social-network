package groups

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"social-network/pkg/models"
	"social-network/pkg/notifications"
	"social-network/pkg/utils"
)

func CreateGroup(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var group models.Group
	err := json.NewDecoder(r.Body).Decode(&group)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err = ValidateGroup(group)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	tx, err := db.Begin()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	query := `INSERT INTO groups (admin_id, name, description) VALUES (?, ?, ?)`
	result, err := tx.Exec(query, userId, group.Name, group.Description)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		if err.Error() == "UNIQUE constraint failed: groups.name" {
			utils.WriteJSON(w, http.StatusBadRequest, "Group name already exists Try a different name")
		} else {
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal server error")
		}
		tx.Rollback()
		return
	}

	groupId, err := result.LastInsertId()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		tx.Rollback()
		utils.WriteJSON(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	addAdminQuery := `INSERT INTO group_members (user_id, group_id, accepted) VALUES (?, ?, ?)`
	_, err = tx.Exec(addAdminQuery, userId, groupId, 1)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		tx.Rollback()
		utils.WriteJSON(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	if group.InvitedUsers != nil && len(group.InvitedUsers) > 0 {
		invitationQuery := `INSERT INTO group_members (user_id, group_id) VALUES (?, ?)`
		for _, invitedId := range group.InvitedUsers {
			result, err = tx.Exec(invitationQuery, invitedId, groupId)
			if err != nil {
				fmt.Fprintln(os.Stderr, err)
				tx.Rollback()
				utils.WriteJSON(w, http.StatusInternalServerError, "Internal server error")
				return
			}
			referenceId, err := result.LastInsertId()
			if err != nil {
				fmt.Fprintln(os.Stderr, err)
				tx.Rollback()
				utils.WriteJSON(w, http.StatusInternalServerError, "Internal server error")
				return
			}
			notifications.SendNotification(tx, db, userId, invitedId, "group_invitation", int(referenceId), map[string]any{
				"group_id":   groupId,
				"group_name": group.Name,
			})

		}
	}

	err = tx.Commit()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	utils.WriteJSON(w, http.StatusCreated, "Group created successfully")
}

func ValidateGroup(group models.Group) error {
	if len(group.Name) < 3 || len(group.Name) > 15 {
		return errors.New("invalid Name length")
	} else if len(group.Description) < 1 || len(group.Description) > 500 {
		return errors.New("invalid Description length")
	}
	return nil
}
