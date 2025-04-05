package users

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strings"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func Profile(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	// Extract username from URL path
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "Invalid request"})
		return
	}

	// Handle /profile endpoint (get current user)
	if len(pathParts) == 3 {
		profile, err := GetUserData(db, &userId, nil)
		if err != nil {
			fmt.Fprintln(os.Stderr, "error in GetUserData:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
			return
		}
		utils.WriteJSON(w, http.StatusOK, profile)
		return
	}

	// Get username from path
	username := pathParts[len(pathParts)-1]

	// Handle /profile/me endpoint
	if username == "me" {
		profile, err := GetUserData(db, &userId, nil)
		if err != nil {
			fmt.Fprintln(os.Stderr, "error in GetUserData:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
			return
		}
		utils.WriteJSON(w, http.StatusOK, profile)
		return
	}

	// Get user ID from username for /profile/{username}
	var targetUserId int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&targetUserId)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteJSON(w, http.StatusNotFound, models.HttpError{Error: "User not found"})
			return
		}
		fmt.Fprintln(os.Stderr, "error getting user ID:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
		return
	}

	// Get profile data
	profile, err := GetUserData(db, &userId, &targetUserId)
	if err != nil {
		fmt.Fprintln(os.Stderr, "error in GetUserData:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, profile)
}
