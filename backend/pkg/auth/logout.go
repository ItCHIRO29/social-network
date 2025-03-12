package auth

import (
	"database/sql"
	"net/http"
)

func Logout(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "Failed to get cookie", http.StatusUnauthorized)
			return
		}
		token := cookie.Value

		query := "DELETE FROM sessions WHERE id = ?"
		_, err = db.Exec(query, token)
		if err != nil {
			http.Error(w, "Failed to delete session", http.StatusInternalServerError)
			return
		}
		cookie = &http.Cookie{
			Name:     "token",
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
		}
		http.SetCookie(w, cookie)
	}
}
