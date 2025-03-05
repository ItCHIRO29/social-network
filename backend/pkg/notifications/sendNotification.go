package notifications

import (
	"database/sql"
	"time"
)

func SendNotification(tx *sql.Tx, senderId int, receiverId int, notifType string, referenceId int) error {
	_, err := tx.Exec("INSERT INTO notifications (sender_id, receiver_id, type, reference_id, created_at) VALUES (?, ?, ?, ?, ?)", senderId, receiverId, notifType, referenceId, time.Now().Format("2006-01-02 15:04:05.999999999Z07:00"))
	// here will send error the websocket channel
	return err
}
