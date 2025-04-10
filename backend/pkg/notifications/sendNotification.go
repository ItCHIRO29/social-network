package notifications

import (
	"database/sql"
	"encoding/json"
	"social-network/pkg/utils"
	ws "social-network/pkg/websocket"
	"time"
)

func SendNotification(tx *sql.Tx, db *sql.DB, senderId int, receiverId int, notifType string, referenceId int, additionalData map[string]any) error {
	jsonAdditionalData, err := json.Marshal(additionalData)
	if err != nil {
		return err
	}
	_, err = tx.Exec("INSERT INTO notifications (sender_id, receiver_id, type, reference_id, created_at, additional_data) VALUES (?, ?, ?, ?, ?, ?)", senderId, receiverId, notifType, referenceId, time.Now().Format("2006-01-02 15:04:05.999999999Z07:00"), jsonAdditionalData)
	senderUsername, err := utils.GetUsernameFromId(db, senderId)
	if err != nil {
		return err
	}
	receiverUsername, err := utils.GetUsernameFromId(db, receiverId)
	if err != nil {
		return err
	}

	message := ws.Message{
		"type":              "notification",
		"sender":            senderUsername,
		"receiver":          receiverUsername,
		"notification_type": notifType,
		"reference_id":      referenceId,
	}
	if (notifType == "group_invitation" || notifType == "request_join_group") && additionalData != nil {
		message["group_data"] = additionalData
	}

	ws.Hub.Private <- message
	return err
}
