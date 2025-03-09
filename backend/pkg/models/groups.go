package models

type Groups struct {
	Id          int    `json:"id_group"`
	Admin       string `json:"admin"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
