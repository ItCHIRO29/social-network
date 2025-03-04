package models

type Post struct {
	ID            int      `json:"id"`
	UserID        int      `json:"user_id"`
	Title         string   `json:"title"`
	Content       string   `json:"content"`
	Author        string   `json:"author"`
	Created       string   `json:"date"`
	Likes         int      `json:"likes"`
	Image		 string   `json:"image"`
	Dislikes      int      `json:"dislikes"`
	IsLiked       bool     `json:"isliked"`
	IsDisliked    bool     `json:"isdisliked"`
	CommentsCount int      `json:"comments_count"`
	Type  string     `json:"Type"`
}

const PostsPerPage = 10