package models

type Posts struct {
	ID           int
	UserID       int
	Post_creator string `json:"post_creator"`
	GroupId      int
	Title        string
	Content      string
	CreatedAt    string
	Image        string
	Type         string
}
