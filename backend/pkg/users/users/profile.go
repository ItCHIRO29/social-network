package users

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"social-network/pkg/utils"
)

func GetProfile(w http.ResponseWriter, r *http.Request, db *sql.DB, userID int) {
	username := r.FormValue("username")
	var profileID int
	if username != "" {
		var err error
		profileID, err = utils.GetUserIdFromUsername(db, username)
		if err != nil {
			fmt.Fprintln(os.Stderr, "Error in GetProfile:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, err)
			return
		}
	} else {
		profileID = userID
	}

	user, err := GetUserData(db, userID, profileID)
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error in GetProfile:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, err)
		return
	}

	utils.WriteJSON(w, http.StatusOK, user)
}
