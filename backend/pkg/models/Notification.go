package models

type Notification struct {
	NotificationId int    `json:"notification_id"`
	UserId         int    `json:"user_id"`
	Receiver_id    int    `json:"receiver_id"`
	Receiver_name  string `json:"receiver_name"`
	Sender_id      int    `json:"sender_id"`
	Sender_name    string `json:"sender_name"`
	Sender_image   string `json:"image"`
	Type           string `json:"type"`
	Reference_id   int    `json:"reference_id"`
	Content        string `json:"content"`
	Seen           bool   `json:"seen"`
	CreatedAt      string `json:"created_at"`
}
