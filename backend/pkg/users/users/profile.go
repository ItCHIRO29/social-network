package users

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func Profile(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	err := r.ParseForm()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "Invalid request"})
		return
	}
	// me := r.FormValue("user")
	// fmt.Println("me value", me)
	// userName := r.FormValue("username")
	idStr := r.FormValue("id")
	if idStr == "0" {
		profile, err := GetUserData(db, &userId, nil)
		if err != nil {
			fmt.Fprintln(os.Stderr, "error in GetUserData:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
			return
		}
		utils.WriteJSON(w, http.StatusOK, profile)
	} else if idStr != "" {
		// fmt.Println("userName:", userName)
		// id, err := utils.GetUserIdFromUsername(db, userName)
		// if err != nil {
		// 	if err == sql.ErrNoRows {
		// 		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "User not found"})
		// 		return
		// 	}
		// 	fmt.Fprintln(os.Stderr, err)
		// 	utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
		// 	return
		// }
		id, err := strconv.Atoi(idStr)
		if err != nil {
			fmt.Fprintln(os.Stderr, "error in strconv.Atoi:", err)
			utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "Invalid request"})
			return
		}
		//fmt.Println("id:", id)
		profile, err := GetUserData(db, &userId, &id)
		if err != nil {
			fmt.Fprintln(os.Stderr, "error in GetUserData:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
			return
		}
		utils.WriteJSON(w, http.StatusOK, profile)
	}
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
