package users

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func Profile(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Println("Profile triggered")
	fmt.Println("userId", userId)
	err := r.ParseForm()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "Invalid request"})
		return
	}
	// me := r.FormValue("me")
	// userName := r.FormValue("username")

	// if me == "true" {
	profile, err := GetUserData(db, userId)
	if err != nil {
		fmt.Fprintln(os.Stderr, "error in GetUserData:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
		return
	}
	fmt.Println("profile:", profile)
	utils.WriteJSON(w, http.StatusOK, profile)
	// return
	// } else if userName != "" {
	// 	profile, err := GetUserData(db, userId)
	// 	if err != nil {
	// 		fmt.Fprintln(os.Stderr, "error in GetUserData:", err)
	// 		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
	// 		return
	// 	}
	// 	utils.WriteJSON(w, http.StatusOK, profile)
	// }
}
