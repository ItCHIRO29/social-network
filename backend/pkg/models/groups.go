package models

type Groups struct {
	Id          int    `json:"id_group"`
	Admin_id    int    `json:"admin_id"`
	Admin       string `json:"admin"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Member struct {
	Id       int    `json:"id_member"`
	User_id  int    `json:"user_id"`
	Group_id int    `json:"group_id"`
	//Accepted bool   `json:"accepted"`
	// User     string `json:"user"`
}

type Group struct {
	Id int `json:"id_group"`
	// Admin_id    int    `json:"admin_id"`
	// Admin       string `json:"admin"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Events      []Event
	Members     []Member
	// posts        []Post
}
