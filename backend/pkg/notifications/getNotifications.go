package notifications

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetNotifications(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	// fmt.Println("GetNotifications")
	query := `SELECT n.id, n.sender_id, n.receiver_id, n.type, n.reference_id, n.created_at, u.image, n.additional_data, n.seen FROM notifications n JOIN users u ON n.sender_id = u.id WHERE (n.receiver_id = $1 AND n.sender_id != $1) ORDER BY n.id DESC`
	rows, err := db.Query(query, userId)
	if err != nil {
		fmt.Println("error in GetNotifications", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	notifications := []models.Notification{}
	for rows.Next() {
		var notification models.Notification
		var senderId int
		var receiverId int
		var createdAtStr string
		var additionalData string
		err := rows.Scan(&notification.Id, &senderId, &receiverId, &notification.Type, &notification.ReferenceId, &createdAtStr, &notification.Image, &additionalData, &notification.Seen)
		if err != nil {
			fmt.Println("error in GetNotifications", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
		if additionalData != "" {
			err = json.Unmarshal([]byte(additionalData), &notification.AdditionalData)
			if err != nil {
				fmt.Println("error in GetNotifications", err)
				http.Error(w, "internal server error", http.StatusInternalServerError)
				return
			}
		}
		createdAt, err := time.Parse("2006-01-02 15:04:05.999999999Z07:00", createdAtStr)
		if err != nil {
			fmt.Printf("error parsing timestamp %s: %v\n", createdAtStr, err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
		notification.CreatedAt = createdAt
		notification.Sender, err = utils.GetUsernameFromId(db, senderId)
		if err != nil {
			fmt.Println("error in GetNotifications get sender username", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
		notification.Receiver, err = utils.GetUsernameFromId(db, receiverId)
		if err != nil {
			fmt.Println("error in GetNotifications get receiver username", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
		notifications = append(notifications, notification)
	}
	utils.WriteJSON(w, 200, notifications)
}
