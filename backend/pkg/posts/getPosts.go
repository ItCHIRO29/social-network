package posts

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetPosts(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Println("GetPosts")
	var creator_first_name string
	var creator_last_name string
	var profile_image string
	var posts []models.Posts
	// var specific_id int
	var rows *sql.Rows
	var err error
	query := ""
	user_id_str := r.URL.Query().Get("id")
	if user_id_str == "" {
		query = `SELECT 
    posts.id, 
    posts.user_id, 
    posts.title, 
    posts.content, 
    posts.created_at, 
    posts.image
FROM posts
LEFT JOIN json_each(posts.can_see) ON true
WHERE 
    posts.privacy = 'public' 
    OR (posts.privacy = 'private' AND posts.user_id IN (
        SELECT following_id
        FROM followers
        WHERE follower_id = ? AND accepted = 1
    ))
    OR (posts.privacy = 'semi-private' AND json_each.value = ?)
ORDER BY posts.id DESC;`
		rows, err = db.Query(query, userId, userId)
		if err != nil {
			fmt.Println("error in GetPosts:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		// return
	} else {
		if user_id_str == "0" {
			query = "SELECT id, user_id, title, content, created_at, image  FROM posts WHERE user_id = ? ORDER BY id DESC"
			rows, err = db.Query(query, userId)
			if err != nil {
				fmt.Println("error in GetPosts:", err)
				utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
				return
			}
		} else {
			specific_id, err1 := strconv.Atoi(user_id_str)
			if err1 != nil {
				fmt.Println("error in GetPosts:", err1)
				utils.WriteJSON(w, http.StatusBadRequest, "Invalid user ID")
				return
			}

			query := `
    SELECT id, user_id, title, content, created_at, image
    FROM posts
    WHERE 
        (privacy != 'semi-private' AND user_id = ?)
        OR 
        (privacy = 'semi-private' AND EXISTS (
            SELECT 1
            FROM json_each(posts.can_see)
            WHERE json_each.value = ?
        ) AND user_id = ?)
    ORDER BY id DESC;`

			rows, err = db.Query(query, specific_id, userId, specific_id)
			if err != nil {
				fmt.Println("error in GetPosts:", err)
				utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
				return
			}
		}
	}

	defer rows.Close()
	for rows.Next() {
		var post models.Posts
		post.GroupId = 1
		err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.CreatedAt, &post.Image)
		if err != nil {
			fmt.Println("error in GetPosts:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		query := "SELECT first_name,last_name, image FROM users WHERE id = ?"
		err = db.QueryRow(query, post.UserID).Scan(&creator_first_name, &creator_last_name, &profile_image)
		if err != nil {
			fmt.Println("error in GetPosts1:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		if post.Image != "" {
			post.Image = strings.Trim(post.Image, "./")
		}
		creator := creator_first_name + " " + creator_last_name
		post.Post_creator = creator
		post.ProfileImage = strings.Trim(profile_image, "./")
		posts = append(posts, post)
	}
	utils.WriteJSON(w, http.StatusOK, posts)
}

func GetPostsByGroup(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Println("GetPostsByGroup")
	var creator_first_name string
	var creator_last_name string
	var profile_image string
	var posts []models.Posts
	var rows *sql.Rows
	var err error
	query := ""
	group_id := r.URL.Query().Get("groupId")
	query = "SELECT id, user_id, group_id, title, content, created_at, image  FROM posts WHERE group_id = ? ORDER BY id DESC"
	rows, err = db.Query(query, group_id)
	if err != nil {
		fmt.Println("error in GetPosts:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	defer rows.Close()
	for rows.Next() {
		var post models.Posts
		post.GroupId = 1
		err := rows.Scan(&post.ID, &post.UserID, &post.GroupId, &post.Title, &post.Content, &post.CreatedAt, &post.Image)
		if err != nil {
			fmt.Println("error in GetPosts:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		query := "SELECT first_name,last_name, image FROM users WHERE id = ?"
		err = db.QueryRow(query, post.UserID).Scan(&creator_first_name, &creator_last_name, &profile_image)
		if err != nil {
			fmt.Println("error in GetPosts1:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
		if post.Image != "" {
			post.Image = strings.Trim(post.Image, "./")
		}
		creator := creator_first_name + " " + creator_last_name
		post.Post_creator = creator
		post.ProfileImage = strings.Trim(profile_image, "./")
		posts = append(posts, post)
	}
	// fmt.Println("Get GroupPosts =======>", posts)
	utils.WriteJSON(w, http.StatusOK, posts)
}
