package users

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"social-network/pkg/utils"
)

func GetAllUsers(w http.ResponseWriter, r *http.Request, db *sql.DB, userID int) {
	fmt.Println("GetAllUsers triggered!")

	// Initialize the struct properly
	type User struct {
		FullName string `json:"full_name"`
		Image    string `json:"image"`
	}
	var AllUsers struct {
		Users []User `json:"users"`
	}

	query := "SELECT first_name, last_name, image FROM users WHERE id != ?"
	rows, err := db.Query(query, userID)
	if err != nil {
		fmt.Println("Error executing query:", err)
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var firstName, lastName, image string
		if err := rows.Scan(&firstName, &lastName, &image); err != nil {
			fmt.Println("Error scanning row:", err)
			http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
			return
		}

		fullName := firstName + " " + lastName
		user := User{
			FullName: fullName,
			Image:    strings.Trim(image, "./"),
		}
		AllUsers.Users = append(AllUsers.Users, user)

		// fmt.Println("Added User:", user)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error iterating rows:", err)
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}

	// fmt.Println("All Users:", AllUsers)
	utils.WriteJSON(w, http.StatusOK, AllUsers)
}
