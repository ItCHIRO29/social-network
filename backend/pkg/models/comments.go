package models

type Comment struct {
	ID         int
	Content    string `json:"content"`
	PostID     int    `json:"postid"`
	AuthorID   int
	AuthorName string
	CreatedAt  string
	Image      string 
}
