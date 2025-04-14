package models

type Event struct {
	EventID     int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	GroupId     int    `json:"group_id"`
	GroupName   string `json:"group_name"`
	UserID      int
	Date        string `json:"date"`
	Username    string
	GoingCount       int
	NotGoingCount  int
	Going       bool `json:"going"`
}

type Event_members struct {
	ID       int
	UserID   int
	UserName string
	EventID  int  `json:"event_id"`
	Group_id int  `json:"group_id"`
	Going    bool `json:"going"`
}
