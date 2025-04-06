package notifications

import (
	"database/sql"
	"social-network/pkg/utils"
	ws "social-network/pkg/websocket"
	"time"
)

func SendNotification(tx *sql.Tx, db *sql.DB, senderId int, receiverId int, notifType string, referenceId int) error {
	_, err := tx.Exec("INSERT INTO notifications (sender_id, receiver_id, type, reference_id, created_at, content) VALUES (?, ?, ?, ?, ?, ?)", senderId, receiverId, notifType, referenceId, time.Now().Format("2006-01-02 15:04:05.999999999Z07:00"), " ")
	senderUsername, err := utils.GetUsernameFromId(db, senderId)
	if err != nil {
		return err
	}
	receiverUsername, err := utils.GetUsernameFromId(db, receiverId)
	if err != nil {
		return err
	}

	ws.Hub.Private <- ws.Message{
		"type":              "notification",
		"sender":            senderUsername,
		"receiver":          receiverUsername,
		"notification_type": notifType,
		"reference_id":      referenceId,
	}
	return err
}
