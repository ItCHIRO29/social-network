package auth

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"time"

	"social-network/pkg/models"
	"social-network/pkg/utils"

	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

func Login(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userData, err := IsValidLoginForm(r)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, err.Error())
			return
		}

		var userId int
		var password string

		err = db.QueryRow("SELECT id, password FROM users WHERE email=?", userData.Email).Scan(&userId, &password)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			if err == sql.ErrNoRows {
				fmt.Println("Incorrect email")
				utils.WriteJSON(w, http.StatusUnauthorized, models.HttpError{Error: "Incorrect email"})
				return
			}
			fmt.Println("Error while querying the database")
			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
			return
		}

		if CheckPassword(password, userData.Password) {
			fmt.Println("Incorrect Password")
			utils.WriteJSON(w, http.StatusUnauthorized, models.HttpError{Error: "Incorrect Password"})
			return
		}
		cookie, err := generateSessionToken(userId, db)
		if err != nil {
			fmt.Println("Error while generating session token")
			fmt.Fprintln(os.Stderr, err)
			utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "Internal Server Error"})
			return
		}
		http.SetCookie(w, cookie)
		w.WriteHeader(http.StatusOK)
	}
}

func generateSessionToken(userId int, db *sql.DB) (*http.Cookie, error) {
	uuid, err := uuid.NewV4()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return nil, err
	}
	session := uuid.String()
	query := `
        INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET id = $1, expires_at = $3
    `
	_, err = db.Exec(query, session, userId, time.Now().Add(time.Hour*24).Format("2006-01-02 15:04:05.999999999Z07:00"))
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return nil, err
	}

	cookie := http.Cookie{
		Name:     "token",
		Value:    session,
		Expires:  time.Now().Add(time.Hour * 24),
		HttpOnly: true,
		Path:     "/",
	}
	return &cookie, nil
}

func CheckPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}
