package chat

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"social-network/pkg/utils"
	"strconv"
)

func MarkAsSeen(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	messageId, err := strconv.Atoi(r.URL.Query().Get("message_id"))
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, "Invalid message_id parameter")
		return
	}
	_, err = db.Exec("UPDATE private_messages SET seen = true WHERE id = ? AND receiver_id = ?", messageId, userId)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
