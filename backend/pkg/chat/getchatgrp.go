package chat

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"social-network/pkg/utils"
)

func GetChat(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	groupID := r.URL.Query().Get("group_id")
	offsetStr := r.URL.Query().Get("offset")
	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	fmt.Println("offset in backend (group chat):", offset)

	if offset <= 0 {
		// Fetch the latest message ID if no valid offset provided
		query := `SELECT id FROM group_chat WHERE group_id = ? ORDER BY id DESC LIMIT 1`
		err := db.QueryRow(query, groupID).Scan(&offset)
		if err != nil {
			fmt.Fprintln(os.Stderr, "error fetching latest message ID:", err)
			if err == sql.ErrNoRows {
				utils.WriteJSON(w, http.StatusAccepted, "invalid group_id or no messages found")
				return
			}
			utils.WriteJSON(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			return
		}
		offset++
	}

	query := `
	SELECT m.id, u.username, m.sender_id, u.first_name, u.last_name, m.message, m.created_at 
	FROM group_chat m
	JOIN users u ON m.sender_id = u.id
	WHERE m.group_id = ? AND m.id < ? 
	ORDER BY m.id DESC 
	LIMIT 10
	`

	rows, err := db.Query(query, groupID, offset)
	if err != nil {
		fmt.Fprintln(os.Stderr, "query error:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var message Message
		var senderFirstName, senderLastName string
		if err := rows.Scan(&message.Id, &message.Sender, &message.SenderId, &senderFirstName, &senderLastName, &message.Message, &message.CreatedAt); err != nil {
			fmt.Fprintln(os.Stderr, "scan error:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
			return
		}
		messages = append(messages, message)
	}

	if len(messages) == 0 {
		offset = -1
	} else {
		offset = messages[len(messages)-1].Id
		fmt.Println("offset in get group chat handler:", offset)
	}

	utils.WriteJSON(w, http.StatusOK, resp{Messages: messages, Offset: offset})
}
