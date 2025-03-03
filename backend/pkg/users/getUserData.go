package users

// import (
// 	"database/sql"
// 	"fmt"
// 	"net/http"
// 	"os"

// 	"social-network/pkg/models"
// 	"social-network/pkg/utils"
// )

// func GetUserData(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
// 	err := r.ParseForm()
// 	if err != nil {
// 		fmt.Fprintln(os.Stderr, err)
// 		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "Invalid request"})
// 		return
// 	}
// 	me := r.FormValue("me")
// 	userName := r.FormValue("username")

// 	if me == "true" {
// 		profile, err := GetProfileData(db, userId)
// 		if err != nil {
// 			fmt.Fprintln(os.Stderr, "error in GetProfileData:", err)
// 			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
// 			return
// 		}
// 		utils.WriteJSON(w, http.StatusOK, profile)
// 		return
// 	}
// 	if userName != "" {
// 		userId, err := utils.GetUserIdFromUsername(db, userName)
// 		if err != nil {
// 			fmt.Fprintln(os.Stderr, "error in GetUserIdFromUsername:", err)
// 			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
// 			return
// 		}
// 		profile, err := GetProfileData(db, userId)
// 		if err != nil {
// 			fmt.Fprintln(os.Stderr, "error in GetProfileData:", err)
// 			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
// 			return
// 		}
// 		utils.WriteJSON(w, http.StatusOK, profile)
// 		return
// 	}
// 	utils.WriteJSON(w, http.StatusOK, profile)
// }
