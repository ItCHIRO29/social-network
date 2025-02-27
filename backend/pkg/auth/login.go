package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"social-network/pkg/models"
	"social-network/pkg/utils"

	"github.com/gofrs/uuid"
)

func Login(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userData := models.User{}
		err := json.NewDecoder(r.Body).Decode(&userData)
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, "Bad Request")
			return
		}

		if !IsValidLoginForm(userData) {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		var userId int
		var password string

		err = db.QueryRow("SELECT id, password FROM users WHERE email=?", userData.Email).Scan(&userId, &password)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			if err == sql.ErrNoRows {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if !IdenticalPasswords(password, userData.Password) {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		cookie, err := generateSessionToken(userId, db)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			w.WriteHeader(http.StatusInternalServerError)
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
	}
	session := uuid.String()
	query := `
        INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET id = $1, expires_at = $3
    `
	_, err = db.Query(query, session, userId, time.Now().Add(time.Hour*24).Format("2006-01-02 15:04:05.999999999Z07:00"))
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
