package followers

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"social-network/pkg/models"
	"social-network/pkg/utils"

	"github.com/mattn/go-sqlite3"
)

func Follow(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	err := r.ParseForm()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "Invalid request"})
		return
	}
	username := r.FormValue("username")
	if username == "" {
		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "Invalid request"})
		return
	}
	followingId, err := utils.GetUserIdFromUsername(db, username)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "User not found"})
			return
		}
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
		return
	}

	isPublic, err := utils.IsPublicProfile(db, followingId)
	if err != nil {
		fmt.Fprintln(os.Stderr, "IsPublicProfile", err)
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
		return
	}
	_, err = db.Exec("INSERT INTO followers (follower_id, following_id, accepted) VALUES (?, ?, ?)", userId, followingId, isPublic)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		if sqliteErr, ok := err.(sqlite3.Error); ok {
			if sqliteErr.Code == sqlite3.ErrConstraint {
				utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "You are already following this user"})
				return
			}
		}
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
		return
	}
}
