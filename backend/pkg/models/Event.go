package models

type Event struct {
	ID          int    `json:"id"`
	GroupId     int    `json:"group_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type Event_members struct {
	ID       int
	UserID   int
	UserName string
	EventID  int `json:"event_id"`
	Group_id int
	Going    bool
}
