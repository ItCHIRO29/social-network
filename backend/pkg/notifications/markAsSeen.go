package notifications

import (
	"database/sql"
	"net/http"
)

func MarkAsSeen(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
}
