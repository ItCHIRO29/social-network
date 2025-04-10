package groups

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"social-network/pkg/models"
	"social-network/pkg/utils"
	"strconv"
)

func GetMembersToInvite(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	groupId, err := strconv.Atoi(r.FormValue("group_id"))
	if err != nil || groupId < 0 {
		fmt.Fprintln(os.Stderr, "Error converting groupId to int:", err)
		utils.WriteJSON(w, http.StatusBadRequest, "Invalid groupId")
		return
	}

	query := `
	WITH group_info AS (
		SELECT id, admin_id
		FROM groups
		WHERE id = $1
	)
	SELECT u.id, u.username, u.first_name, u.last_name, u.image
	FROM users u
	LEFT JOIN group_info g ON true
	WHERE (
		(g.id IS NOT NULL AND u.id NOT IN (
			SELECT m.user_id
			FROM group_members m
			WHERE m.group_id = $1
		) AND u.id != $2 AND u.id != g.admin_id)
		OR
		(g.id IS NULL AND u.id != $2)
	)
	`

	rows, err := db.Query(query, groupId, userId)
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error querying members to invite:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	defer rows.Close()

	users := make([]models.User, 0)
	for rows.Next() {
		var user models.User
		err = rows.Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Image)
		if err != nil {
			fmt.Fprintln(os.Stderr, "Error scanning member:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal server error")
			return
		}
		users = append(users, user)
	}

	utils.WriteJSON(w, http.StatusOK, users)
}
