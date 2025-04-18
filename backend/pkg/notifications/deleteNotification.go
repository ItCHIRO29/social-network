package notifications

import (
	"database/sql"
	"net/http"

	"social-network/pkg/utils"
)

func DeleteNotification(tx *sql.Tx, referenceId int, notifType string) error {
	_, err := tx.Exec("DELETE FROM notifications WHERE (reference_id = ? AND type = ?)", referenceId, notifType)
	return err
}

func DeleteNotif(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	id := r.URL.Query().Get("id")
	_, err := db.Exec("DELETE FROM notifications WHERE (id= ? AND receiver_id= ?)", id, userId)
	if err != nil {
		utils.WriteJSON(w, 500, err)
	}
	return
}
