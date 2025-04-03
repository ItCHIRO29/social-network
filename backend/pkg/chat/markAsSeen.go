package chat

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"social-network/pkg/utils"
)

func MarkAsSeen(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	username := r.URL.Query().Get("sender")
	uId, err := utils.GetUserIdFromUsername(db, username)
	if err != nil {
		fmt.Fprintln(os.Stderr, err, "error in getting user id")
		if err == sql.ErrNoRows {
			utils.WriteJSON(w, http.StatusBadRequest, "invalid sender username!")
			return
		}
		utils.WriteJSON(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	_, err = db.Exec(`UPDATE private_messages
SET seen = 'true'
WHERE id = (
    SELECT MAX(id)
    FROM private_messages
    WHERE sender_id = ? AND receiver_id = ?
);
`, uId, userId)
	if err != nil {

		fmt.Fprintln(os.Stderr, err, "error in marking as seen")
		utils.WriteJSON(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
