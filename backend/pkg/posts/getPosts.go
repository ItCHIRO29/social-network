package posts

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetPosts(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Println("GetPosts triggered")
	var creator string

	var posts []models.Posts
	rows, err := db.Query("SELECT id, user_id, title, content, created_at, image, privacy  FROM posts WHERE privacy = 'public'")
	if err != nil {
		fmt.Println("error in GetPosts:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	defer rows.Close()
	for rows.Next() {
		var post models.Posts
		post.GroupId = 1
		err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.CreatedAt, &post.Image, &post.Type)
		if err != nil {
			fmt.Println("error in GetPosts:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		query := "SELECT username FROM users WHERE id = ?"
		err = db.QueryRow(query, post.UserID).Scan(&creator)
		if err != nil {
			fmt.Println("error in GetPosts:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		post.Post_creator = creator
		if post.Image != "" {
			post.Image = strings.Trim(post.Image, "./")
		}
		fmt.Println("post image:", post.Image)
		posts = append(posts, post)
		// fmt.Println("posts =======>", posts)
	}
	utils.WriteJSON(w, http.StatusOK, posts)
}
