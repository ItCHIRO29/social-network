package models

type Event struct {
	EventID     int    `json:"id"`
	Title       string `json:"title"`
	UserID      int
	Username    string
	Description string `json:"description"`
	GroupId     int    `json:"group_id"`
	Count       int
}

type Event_members struct {
	ID       int
	UserID   int
	UserName string
	EventID  int `json:"event_id"`
	Group_id int
	Going    bool
}
