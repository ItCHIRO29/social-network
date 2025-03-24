package chat

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"social-network/pkg/utils"
)

func GetChat(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	group_id := r.URL.Query().Get("group_id")
	query := `SELECT m.id, u.username, m.sender_id , u.first_name, u.last_name, m.message, m.created_at 
	FROM group_chat m
	JOIN users u ON m.sender_id = u.id
	WHERE group_id = ? ORDER BY m.id DESC 
	LIMIT 10 `
	rows, err := db.Query(query, group_id)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	messages := []Message{}
	for rows.Next() {
		var message Message
		var senderFirstName string
		var senderLastName string
		if err := rows.Scan(&message.Id, &message.Sender, &message.SenderId, &senderFirstName, &senderLastName, &message.Message, &message.CreatedAt); err != nil {
			fmt.Fprintln(os.Stderr, err)
			utils.WriteJSON(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			return
		}
		messages = append(messages, message)
	}
	utils.WriteJSON(w, 200, messages)
}
