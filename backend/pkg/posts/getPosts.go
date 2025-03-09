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
	// fmt.Println("GetPosts triggered")
	var creator_first_name string
	var creator_last_name string
	var profile_image string
	// fmt.Println("r..URL.Query():", r.URL.Query())
	// SpecificUser_id_str := r.FormValue("id")
	// if SpecificUser_id_str == "" || SpecificUser_id_str == "0" {
	// 	SpecificUser_id_str = strconv.Itoa(userId)
	// }
	// SpecificUser_id, err := strconv.Atoi(SpecificUser_id_str)
	// if err != nil {
	// 	fmt.Println("error in strconv.Atoi:", err)
	// 	utils.WriteJSON(w, http.StatusBadRequest, "Invalid request")
	// 	return
	// }
	// fmt.Println("SpecificUser_id:", SpecificUser_id)
	var posts []models.Posts
	rows, err := db.Query("SELECT id, user_id, title, content, created_at, image, privacy  FROM posts WHERE privacy = 'public' ORDER BY id DESC")
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
		query := "SELECT first_name,last_name, image FROM users WHERE id = ?"
		err = db.QueryRow(query, post.UserID).Scan(&creator_first_name, &creator_last_name, &profile_image)
		if err != nil {
			fmt.Println("error in GetPosts:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		if post.Image != "" {
			post.Image = strings.Trim(post.Image, "./")
		}
		creator := creator_first_name + " " + creator_last_name
		post.Post_creator = creator
		post.ProfileImage = strings.Trim(profile_image, "./")
		// fmt.Println("post:", post)
		// fmt.Println("creator:", creator)
		// fmt.Println("post-creator:", post.Post_creator)
		// fmt.Println("post image:", post.Image)
		posts = append(posts, post)
	}
	// fmt.Println("posts =======>", posts)
	utils.WriteJSON(w, http.StatusOK, posts)
}
