package notifications

import (
	"database/sql"
	"net/http"
)

func MarkAsSeen(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	query := `UPDATE notifications SET seen = true WHERE id = (SELECT id FROM notifications WHERE receiver_id = $1 ORDER BY created_at DESC LIMIT 1)`
	_, err := db.Exec(query, userId)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

}
