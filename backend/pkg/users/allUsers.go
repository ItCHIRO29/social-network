package users

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"social-network/pkg/utils"
)

// Initialize the struct properly
type User struct {
	ID       int    `json:"id"`
	FullName string `json:"full_name"`
	Image    string `json:"image"`
}

func GetAllUsers(w http.ResponseWriter, r *http.Request, db *sql.DB, userID int) {
	// fmt.Println("GetAllUsers triggered!")

	var AllUsers struct {
		HomeUsers []User `json:"users"`
		AllUsers  []User `json:"all_users"`
	}

	query := `SELECT id, first_name, last_name, image
	FROM users
	WHERE id != ? 
		AND id NOT IN (
    	SELECT follower_id FROM followers WHERE following_id = ?
    	UNION
    	SELECT following_id FROM followers WHERE follower_id = ?
	);`
	rows, err := db.Query(query, userID, userID, userID)
	if err != nil {
		fmt.Println("Error executing query ===>", err)
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var uID int
		var firstName, lastName, image string
		if err := rows.Scan(&uID, &firstName, &lastName, &image); err != nil {
			fmt.Println("Error scanning row:", err)
			http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
			return
		}

		fullName := firstName + " " + lastName
		user := User{
			ID:       uID,
			FullName: fullName,
			Image:    strings.Trim(image, "./"),
		}
		AllUsers.HomeUsers = append(AllUsers.HomeUsers, user)
	}
	AllUsers.AllUsers, err = GetAllUserToJoinGroup(db, userID)
	if err != nil  {
		fmt.Println("Error executing query ===>", err)
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	// if err := rows.Err(); err != nil {
	// 	fmt.Println("Error iterating rows:", err)
	// 	http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
	// 	return
	// }

	utils.WriteJSON(w, http.StatusOK, AllUsers)
}

func GetAllUserToJoinGroup(db *sql.DB, userID int) ([]User, error) {
	var AllUsers []User
	query := `SELECT id, first_name, last_name, image FROM users WHERE id != ? AND id NOT IN (SELECT user_id FROM group_members WHERE group_id = ?);`
	rows, err := db.Query(query, userID, userID)
	if err != nil {
		fmt.Println("Error executing query ===>", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var uID int
		var firstName, lastName, image string
		if err := rows.Scan(&uID, &firstName, &lastName, &image); err != nil {
			fmt.Println("Error scanning row:", err)
			return nil, err
		}
		fullName := firstName + " " + lastName
		user := User{
			ID:       uID,
			FullName: fullName,
			Image:    strings.Trim(image, "./"),
		}
		AllUsers = append(AllUsers, user)
		if err := rows.Err(); err != nil {
			fmt.Println("Error iterating rows:", err)
			return nil, err
		}
	}
	return AllUsers, nil
}
