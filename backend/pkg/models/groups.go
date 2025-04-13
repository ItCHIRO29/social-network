package models

type Group struct {
	Id           int      `json:"id"`
	AdminId      int      `json:"admin_id"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	InvitedUsers []int    `json:"invited_users"`
	Members      []Member `json:"members"`
	Events       []Event  `json:"events"`
}

type Member struct {
	Id       int    `json:"id_member"`
	User_id  int    `json:"user_id"`
	Username string `json:"username"`
	Group_id int    `json:"group_id"`
	Accepted bool   `json:"accepted"`
	// User     string `json:"user"`
}
