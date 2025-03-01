package auth

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func Profile(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// var profile models.User
		fmt.Println("profile!!!!!!!!!!!!")
		cookie, err := r.Cookie("session_token")
		if err != nil {
			fmt.Println("error in cookie")
			if err == http.ErrNoCookie {
				utils.WriteJSON(w, http.StatusUnauthorized, models.HttpError{Error: "Unauthorized"})
				return
			}
			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
			return
		}
		userid, _, err := GetUserId(db, cookie.Value)
		if err != nil {
			fmt.Println("error in GetUserId")
			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
			return
		}
		profile, err := GetProfileData(db, userid)
		if err != nil {
			fmt.Println("error in GetProfileData")
			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
			return
		}
		fmt.Println("profile:", profile)
		utils.WriteJSON(w, http.StatusOK, profile)
	}
}
