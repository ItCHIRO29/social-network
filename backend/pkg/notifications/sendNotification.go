package notifications

import (
	"database/sql"
	"encoding/json"
	"social-network/pkg/utils"
	ws "social-network/pkg/websocket"
	"time"
)

func SendGroupNotification(tx *sql.Tx, db *sql.DB, senderId int, groupId int, notifType string, referenceId int, additionalData map[string]any) error {
	members := utils.GetGroupMembers(groupId, db)
	for _, member := range members {
		if member != senderId {
			err := SendNotification(tx, db, senderId, member, notifType, referenceId, additionalData)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

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
		"seen":              false,
		"reference_id":      referenceId,
	}
	if (notifType == "group_invitation" || notifType == "request_join_group" || notifType == "event") && additionalData != nil {
		message["additional_data"] = additionalData
	}

	ws.Hub.Private <- message
	return err
}
