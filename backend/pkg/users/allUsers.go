package users

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

type User struct {
	ID           int                 `json:"id"`
	Username     string              `json:"username"`
	FirstName    string              `json:"first_name"`
	LastName     string              `json:"last_name"`
	Image        string              `json:"image"`
	FollowButton models.FollowButton `json:"follow_button"`
}

func GetAllUsers(w http.ResponseWriter, r *http.Request, db *sql.DB, userID int) {
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		log.Println(err)
		return
	}
	query := `
		SELECT 
			u.id, 
			u.username,
			u.first_name, 
			u.last_name, 
			COALESCE(u.image , 'default-avatar.svg'),
			COALESCE(f.id, 0) AS reference_id,
			CASE
				WHEN f.id IS NOT NULL AND f.accepted = 1 THEN 'unfollow'
				WHEN f.id IS NOT NULL AND f.accepted = 0 THEN 'pending'
				ELSE 'follow'
			END AS follow_button_state 
		FROM users u
		LEFT JOIN followers f ON f.follower_id = ? AND f.following_id = u.id
		WHERE u.id != ?
		LIMIT ? OFFSET ?`
	rows, err := db.Query(query, userID, userID, utils.Limit, utils.Limit*page)
	if err != nil {
		fmt.Println("Error executing query ===>", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Image, &user.FollowButton.ReferenceID, &user.FollowButton.State); err != nil {
			fmt.Println("Error scanning row:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}
	utils.WriteJSON(w, http.StatusOK, users)
}
