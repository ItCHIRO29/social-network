package auth

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"social-network/pkg/utils"
)

func Verify(w http.ResponseWriter, r *http.Request, db *sql.DB, sessionToken string) {
	fmt.Println("Fireeeeeeeeeeeeeeed")
	sessionToken = strings.TrimPrefix(sessionToken, "Bearer ")
	fmt.Println("cookie", sessionToken)
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

	utils.WriteJSON(w, http.StatusAccepted, []byte{})
}
