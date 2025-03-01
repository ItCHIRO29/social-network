package auth

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"social-network/pkg/models"
	"social-network/pkg/utils"

	"golang.org/x/crypto/bcrypt"
)

func Register(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("User created successfully")
		var userData *models.User
		var err error
		if userData, err = IsValidRegisterForm(r, db); err != nil {
			fmt.Fprintln(os.Stderr, "in IsValidRegisterForm", err)
			utils.WriteJSON(w, http.StatusBadRequest, err.Error())
			return
		}

		userData.Image, err = utils.ValidateAndSaveImage(r, "profile", userData.Username)
		if err != nil && err.Error() != "no image" {
			fmt.Fprintln(os.Stderr, "in ValidateAndSaveImage", err)
			utils.WriteJSON(w, http.StatusBadRequest, err.Error())
			return
		}

		// userData.Password, err = HashPassword(userData.Password)
		// userData.Password, err = HashPassword(userData.Password)
		// if err != nil {
		// 	fmt.Fprintln(os.Stderr, "in HashPassword", err)
		// 	utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
		// 	return
		// }
		_, err = db.Exec(`INSERT INTO users (first_name, last_name, nickname, age, gender, bio, image, username, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, userData.FirstName, userData.LastName, userData.Nickname, userData.Age, userData.Gender, userData.Bio, userData.Image, userData.Username, userData.Email, userData.Password)
		if err != nil {
			fmt.Fprintln(os.Stderr, "In Exec", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		// fmt.Println("userData:", userData)
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
