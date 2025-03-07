package models

type Event struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	GroupId     int    `json:"group_id"`
}

type Event_members struct {
	ID       int
	UserID   int
	UserName string
	EventID  int `json:"event_id"`
	Group_id int
	Going    bool
}
