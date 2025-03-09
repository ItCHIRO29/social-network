package models

type Groups struct {
	Id          int    `json:"id_group"`
	Admin_id    int    `json:"admin_id"`
	Admin       string `json:"admin"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
