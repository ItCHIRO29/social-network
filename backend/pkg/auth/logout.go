package auth

import (
	"database/sql"
	"net/http"
)

func Logout(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
}
