package models

import "database/sql"

type Comment struct {
	ID        int
	Content   string `json:"content"`
	PostID    int    `json:"postid"`
	AuthorID  int
	CreatedAt string
	Group_id  sql.NullString
	Image     sql.NullString
}
