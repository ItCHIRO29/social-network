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
	ctx := r.Context()
	var creator_first_name, creator_last_name, profile_image string
	posts := make([]models.Posts, 0)
	var rows *sql.Rows
	var err error
	query := ""

	user_id_str := r.URL.Query().Get("id")
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		fmt.Println(err)
		utils.WriteJSON(w, http.StatusBadRequest, "probleme in provided page")
		return
	}

	if user_id_str == "" {
		query = `
		SELECT 
			posts.id, 
			posts.user_id, 
			posts.title, 
			posts.content, 
			posts.created_at, 
			posts.image,
			posts.privacy
		FROM posts
		LEFT JOIN json_each(posts.can_see) ON true
		WHERE 
			(posts.privacy = 'public' AND posts.user_id IN (
				SELECT following_id
				FROM followers
				WHERE follower_id = ? AND accepted = 1
			))
			OR (posts.privacy = 'semi-private' AND posts.user_id IN (
				SELECT following_id
				FROM followers
				WHERE follower_id = ? AND accepted = 1
			))
			OR ((posts.privacy = 'private' AND json_each.value = ? AND posts.user_id IN (
				SELECT following_id
				FROM followers
				WHERE follower_id = ? AND accepted = 1
			)) OR (posts.privacy = 'private' AND posts.user_id = ?))
		ORDER BY posts.id DESC LIMIT ? OFFSET ?;`

		rows, err = db.Query(query, userId, userId, userId, userId, userId, utils.Limit, utils.Limit*page)
		if err != nil {
			fmt.Println("error in GetPosts:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}
	} else {
		user_id, err := strconv.Atoi(user_id_str)
		if err != nil {
			fmt.Println("error in GetPosts:", err)
			utils.WriteJSON(w, http.StatusBadRequest, "probleme in provided user id")
			return
		}
		if user_id == userId {
			query = `SELECT id, user_id, title, content, created_at, image, privacy
				FROM posts
				WHERE user_id = ? AND privacy != ''
				ORDER BY id DESC LIMIT ? OFFSET ?;`

			rows, err = db.Query(query, userId, utils.Limit, utils.Limit*page)
			if err != nil {
				fmt.Println("error in GetPosts 1 :", err)
				utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
				return
			}
		} else {
			query := ""
			isfollowing := utils.CheckFollowing(db, userId, user_id_str)
			isPub, err := utils.IsPublicProfile(db, user_id)
			if err != nil {
				fmt.Println("error in GetPosts isPublic :", err)
				utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
				return
			}

			if isfollowing {
				query = `
				SELECT id, user_id, title, content, created_at, image, privacy
				FROM posts
				WHERE 
				(privacy = 'public' AND user_id = $1) 
				OR (privacy = 'private' AND EXISTS (
					SELECT 1 FROM json_each(posts.can_see)
					WHERE json_each.value = $2
					) AND user_id = $1)
					OR (privacy = 'semi-private' AND user_id IN (
						SELECT follower_id FROM followers
						WHERE following_id = $1 AND follower_id = $2 AND accepted = 1
						))
						ORDER BY id DESC LIMIT $3 OFFSET $4;`
				rows, err = db.Query(query, user_id, userId, utils.Limit, utils.Limit*page)
				if err != nil {
					fmt.Println("error in GetPosts:", err)
					utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
					return
				}
			} else if isPub && !isfollowing {
				query = `
				SELECT id, user_id, title, content, created_at, image, privacy
				FROM posts
				WHERE privacy = 'public' AND user_id = ?
				ORDER BY id DESC LIMIT ? OFFSET ?;
				`
				rows, err = db.Query(query, user_id, utils.Limit, utils.Limit*page)
				if err != nil {
					fmt.Println("error in GetPosts:", err)
					utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
					return
				}
			} else {
				utils.WriteJSON(w, http.StatusOK, []models.Posts{})
				return
			}

		}
	}

	defer rows.Close()

	for rows.Next() {
		var post models.Posts
		post.GroupId = 1
		err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.CreatedAt, &post.Image, &post.Type)
		if err != nil {
			fmt.Println("error in GetPosts 2 :", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}

		userQuery := `SELECT first_name, last_name, image, username FROM users WHERE id = ?`
		err = db.QueryRowContext(ctx, userQuery, post.UserID).Scan(&creator_first_name, &creator_last_name, &profile_image, &post.Username)
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
	var creator_first_name string
	var creator_last_name string
	var profile_image string
	var posts []models.Posts
	var rows *sql.Rows
	var err error
	query := ""
	group_name := r.URL.Query().Get("groupId")
	var group_id int
	if group_name != "" {
		query = `SELECT id FROM groups WHERE name = ?`
		err = db.QueryRow(query, group_name).Scan(&group_id)
		if err != nil {
			fmt.Println("error in GetPosts:", err)
			utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
			return
		}

	}

	IsMemb := IsMember(db, group_id, userId)
	if !IsMemb {
		fmt.Println("You are not a member of this group")
		utils.WriteJSON(w, http.StatusUnauthorized, "You are not a member of this group")
		return
	}
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
		query := "SELECT first_name,last_name, image, username FROM users WHERE id = ?"
		err = db.QueryRow(query, post.UserID).Scan(&creator_first_name, &creator_last_name, &profile_image, &post.Username)
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

func IsMember(db *sql.DB, groupId int, userId int) bool {
	var isMember bool
	query := "SELECT EXISTS (SELECT 1 FROM group_members WHERE user_id = ? AND group_id= ? AND accepted = 1)"
	err := db.QueryRow(query, userId, groupId).Scan(&isMember)
	if err != nil {
		fmt.Println("Error checking if user is a member:", err)
		return false
	}
	return isMember
}
