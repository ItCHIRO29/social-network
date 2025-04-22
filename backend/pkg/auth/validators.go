package auth

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"slices"
	"strings"
	"time"

	"social-network/pkg/models"

	"golang.org/x/crypto/bcrypt"
)

func IdenticalPasswords(hashedPassword string, password string) bool {
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)); err != nil {
		return false
	}
	return true
}

func AlreadyExists(email string, username string, nickname string, db *sql.DB) error {
	emailCount := 0
	usernameCount := 0
	nicknameCount := 0
	db.QueryRow("SELECT COUNT(*) FROM users WHERE email=?", email).Scan(&emailCount)
	db.QueryRow("SELECT COUNT(*) FROM users WHERE username=?", username).Scan(&usernameCount)
	db.QueryRow("SELECT COUNT(*) FROM users WHERE nickname=? AND nickname != ''", nickname).Scan(&nicknameCount)
	if emailCount > 0 {
		return errors.New("email already exists")
	} else if usernameCount > 0 {
		return errors.New("username already exists")
	} else if nicknameCount > 0 {
		return errors.New("nickname already exists")
	} else {
		return nil
	}
}

func IsValidName(name string) bool {
	re, err := regexp.Compile(`^([a-zA-Z]+\s?){3,29}[a-zA-Z]+$`)
	if err != nil {
		return false
	}
	matched := re.MatchString(name)
	return matched
}

func IsValidBirthDay(birthday string) bool {
	birthTime, err := time.Parse("2006-01-02", birthday)
	if err != nil {
		return false
	}

	now := time.Now()
	age := now.Year() - birthTime.Year()

	if now.YearDay() < birthTime.YearDay() {
		age--
	}

	return age >= 16 && age <= 160
}

func IsValidGender(gender string) bool {
	gender = strings.ToLower(gender)
	genders := []string{"male", "female"}
	return slices.Contains(genders, gender)
}

func IsValidUsername(nickname string) bool {
	re, err := regexp.Compile(`^[a-zA-Z1-9-_]{4,30}$`)
	if err != nil {
		return false
	}
	return re.MatchString(nickname)
}

func IsValidNickname(nickname string) bool {
	if nickname == "" {
		return true
	} else {
		return IsValidUsername(nickname)
	}
}

func IsValidEmail(email string) bool {
	re, err := regexp.Compile(`^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$`)
	if err != nil || len(email) >= 255 {
		return false
	}
	return re.MatchString(email)
}

func IsValidPassword(password string) bool {
	if len(password) < 8 || len(password) > 254 {
		return false
	}
	hasLower := false
	hasUpper := false
	hasDigit := false
	hasSpecial := false
	for _, char := range password {
		switch {
		case 'a' <= char && char <= 'z':
			hasLower = true
			continue
		case 'A' <= char && char <= 'Z':
			hasUpper = true
			continue
		case '0' <= char && char <= '9':
			hasDigit = true
			continue
		case strings.ContainsRune("!@#$%^&*()_+-=[]{}; ':\"\\|,.<>/?", char):
			hasSpecial = true
			continue
		}
		return false
	}
	return hasLower && hasUpper && hasDigit && hasSpecial
}

func IsValidBio(bio string) bool {
	if len(bio) > 0 {
		return len(bio) <= 255
	}
	return true
}

func IsValidRegisterForm(r *http.Request, db *sql.DB) (*models.User, error) {
	user := models.User{
		FirstName: r.FormValue("first_name"),
		LastName:  r.FormValue("last_name"),
		Nickname:  r.FormValue("nickname"),
		BirthDay:  r.FormValue("birth_day"),
		Gender:    r.FormValue("gender"),
		Bio:       r.FormValue("bio"),
		Username:  r.FormValue("username"),
		Email:     r.FormValue("email"),
		Password:  r.FormValue("password"),
	}
	if !IsValidName(user.FirstName) {
		return nil, errors.New("invalid first name")
	}
	if !IsValidName(user.LastName) {
		return nil, errors.New("invalid last name")
	}

	if !IsValidBirthDay(user.BirthDay) {
		return nil, errors.New("invalid age")
	}
	if !IsValidGender(user.Gender) {
		return nil, errors.New("invalid gender")
	}
	if !IsValidEmail(user.Email) {
		return nil, errors.New("invalid email")
	}

	if !IsValidNickname(user.Nickname) {
		return nil, errors.New("invalid nickname")
	}

	if !IsValidUsername(user.Username) {
		return nil, errors.New("invalid username")
	}

	if err := AlreadyExists(user.Email, user.Username, user.Nickname, db); err != nil {
		return nil, err
	}

	if !IsValidPassword(user.Password) {
		return nil, errors.New("invalid password")
	}
	if !IsValidBio(user.Bio) {
		return nil, errors.New("invalid bio")
	}
	return &user, nil
}

func IsValidLoginForm(r *http.Request) (*models.User, error) {
	var user1 struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	json.NewDecoder(r.Body).Decode(&user1)

	if !IsValidEmail(user1.Email) {
		fmt.Println("invalid email")
		return nil, errors.New("invalid email")
	}
	if !IsValidPassword(user1.Password) {
		fmt.Println("invalid password")
		return nil, errors.New("invalid password")
	}
	user := models.User{
		Username: "username",
		Email:    user1.Email,
		Password: user1.Password,
	}
	return &user, nil
}
