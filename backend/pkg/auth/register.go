package auth

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"time"

	"social-network/pkg/models"
	"social-network/pkg/utils"

	"golang.org/x/crypto/bcrypt"
)

func Register(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userData *models.User
		var err error
		if userData, err = IsValidRegisterForm(r, db); err != nil {
			fmt.Fprintln(os.Stderr, "in IsValidRegisterForm", err)
			utils.WriteJSON(w, http.StatusBadRequest, err.Error())
			return
		}

		userData.Image, err = utils.ValidateAndSaveImage(r, "profile", userData.Username)
		if err != nil {
			fmt.Fprintln(os.Stderr, "in ValidateAndSaveImage", err)
			utils.WriteJSON(w, http.StatusBadRequest, err.Error())
			return
		}
		if userData.Image == "" {
			userData.Image = "uploads/profileImages/default-avatar.svg"
		}
		res, err := db.Exec(`INSERT INTO users (first_name, last_name, nickname, DateBirth, gender, bio, image, username, email, password, last_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, userData.FirstName, userData.LastName, userData.Nickname, userData.BirthDay, userData.Gender, userData.Bio, userData.Image, userData.Username, userData.Email, userData.Password, time.Now().Format("2006-01-02 15:04:05"))
		if err != nil {
			fmt.Fprintln(os.Stderr, "In Exec", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		userId, err := res.LastInsertId()
		if err != nil {
			fmt.Fprintln(os.Stderr, "In LastInsertId", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		cookie, err := generateSessionToken(int(userId), db)
		if err != nil {
			fmt.Println("Error while generating session token")
			fmt.Fprintln(os.Stderr, err)
			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
			return
		}
		http.SetCookie(w, cookie)
		utils.WriteJSON(w, http.StatusCreated, "User created successfully")
	}
}

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return "", err
	}
	return string(hashedPassword), err
}
