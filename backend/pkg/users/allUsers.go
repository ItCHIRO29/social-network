package users

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetAllUsers(w http.ResponseWriter, r *http.Request, db *sql.DB, userID int) {
	var AllUsers struct {
		HomeUsers []models.User `json:"users"`
		AllUsers  []models.User `json:"all_users"`
	}

	query := `
		SELECT 
			u.id,
			u.first_name,
			u.last_name,
			u.image,
			u.username,
			CASE 
				WHEN f.id IS NOT NULL AND f.accepted = 0 THEN 'pending'
				WHEN f.id IS NOT NULL AND f.accepted = 1 THEN 'unfollow'
				ELSE 'follow'
			END as follow_state,
			COALESCE(f.id, 0) as reference_id
		FROM users u
		LEFT JOIN followers f ON u.id = f.following_id AND f.follower_id = ?
		WHERE u.id != ?
		ORDER BY u.first_name, u.last_name
	`

	rows, err := db.Query(query, userID, userID)
	if err != nil {
		fmt.Println("Error executing query ===>", err)
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		var followState string
		var referenceID int64
		if err := rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Image, &user.Username, &followState, &referenceID); err != nil {
			fmt.Println("Error scanning row:", err)
			http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
			return
		}

		user.Image = strings.Trim(user.Image, "./")
		user.FollowButton = models.FollowButton{
			State:       followState,
			ReferenceID: referenceID,
		}
		AllUsers.HomeUsers = append(AllUsers.HomeUsers, user)
	}

	AllUsers.AllUsers, err = GetAllUserToJoinGroup(db, userID)
	if err != nil {
		fmt.Println("Error executing query ===>", err)
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusOK, AllUsers)
}

func GetAllUserToJoinGroup(db *sql.DB, userID int) ([]models.User, error) {
	var users []models.User
	query := `SELECT id, first_name, last_name, image, username FROM users WHERE id != ? AND id NOT IN (SELECT user_id FROM group_members WHERE group_id = ?);`
	rows, err := db.Query(query, userID, userID)
	if err != nil {
		fmt.Println("Error executing query ===>", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Image, &user.Username); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}
		user.Image = strings.Trim(user.Image, "./")
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error iterating rows:", err)
		return nil, err
	}

	return users, nil
}
