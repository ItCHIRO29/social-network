package models

type Chat struct {
	ChatId     int    `json:"chat_id"`
	UserId     int    `json:"user_id"`
	ReceiverId int    `json:"receiver_id"`
	Content    string `json:"content"`
	CreatedAt  string `json:"created_at"`
}

type Chaters struct {
	ID         int    `json:"id"`
	User1_id   int    `json:"user1_id"`
	User2_id   int    `json:"receiver_id"`
	User1_name string `json:"user1_name"`
	User2_name string `json:"user2_name"`
	Image      string `json:"image"`
}
