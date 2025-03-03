package notifications

import (
	"database/sql"
	"net/http"
)

func SendNotification(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
}
