package auth

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/utils"
)

func Verify(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cokie, err := r.Cookie("token")
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		userId := 0
		err = db.QueryRow("SELECT user_id, expires_at FROM sessions WHERE id=?", cokie.Value).Scan(&userId)
		if err != nil {
			if err == sql.ErrNoRows || userId == 0 {
				fmt.Println("error and user id ", err, userId)
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		utils.WriteJSON(w, 200, userId)
	}
}
