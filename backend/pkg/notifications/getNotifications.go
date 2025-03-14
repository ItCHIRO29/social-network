package notifications

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetNotifications(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	// fmt.Println("GetNotifications")
	query := `SELECT * FROM notifications WHERE (receiver_id = $1 AND sender_id != $1)`
	rows, err := db.Query(query, userId)
	if err != nil {
		fmt.Println("error in GetNotifications", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	notifications := []models.Notification{}
	for rows.Next() {
		var notification models.Notification
		err := rows.Scan(&notification.NotificationId, &notification.Receiver_id, &notification.Sender_id, &notification.Type, &notification.Reference_id, &notification.Content, &notification.Seen, &notification.CreatedAt)
		if err != nil {
			fmt.Println("error in GetNotifications", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		notification.UserId = userId
		notification.Receiver_name = utils.GetUserName(db, notification.Receiver_id)
		notification.Sender_name = utils.GetUserName(db, notification.Sender_id)
		err = db.QueryRow("SELECT image FROM users WHERE id = ?", notification.Sender_id).Scan(&notification.Sender_image)
		if err != nil {
			fmt.Println("error in GetNotifications", err)
			return
		}
		notification.Sender_image = strings.Trim(notification.Sender_image, "./")
		// fmt.Println("notification", notification.Sender_image)
		notifications = append(notifications, notification)
	}
	// fmt.Println("notifications", notifications)
	utils.WriteJSON(w, 200, notifications)
}
