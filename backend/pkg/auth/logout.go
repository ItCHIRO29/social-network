package auth

import (
	"database/sql"
	"net/http"
)

func Logout(db *sql.DB, userId int) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie := &http.Cookie{
			Name:     "token",
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
		}
		http.SetCookie(w, cookie)
		query := "DELETE FROM sessions WHERE user_id = ?"
		_, err := db.Exec(query, userId)
		if err != nil {
			http.Error(w, "Failed to delete session", http.StatusInternalServerError)
			return
		}
	}
}
