package auth

import (
	"database/sql"
	"net/http"
	"strings"
)

func Verify(w http.ResponseWriter, r *http.Request, db *sql.DB, sessionToken string) {
	sessionToken = strings.TrimPrefix(sessionToken, "Bearer ")
	if sessionToken == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	userId := 0
	err := db.QueryRow("SELECT user_id FROM sessions WHERE id=?", sessionToken).Scan(&userId)
	if err != nil {
		if err == sql.ErrNoRows || userId == 0 {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
