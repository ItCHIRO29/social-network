package posts

import (
	"database/sql"
	"net/http"
	"social-network/pkg/models"
	"social-network/pkg/utils"
	"strconv"
	"time"

	
)

func GetPosts(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		num, err := strconv.Atoi(r.URL.Query().Get("page"))
		if err != nil {
			utils.WriteJSON(w, http.StatusBadRequest, nil)
			return
		}

		var Posts []models.Post

		cookie, err := r.Cookie("session_token")
		id := 0
		if err != http.ErrNoCookie || CheckExpiredCookie(cookie.Value, time.Now(), db) {
			_, id, err = GetId(cookie.Value, db)
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, struct {
					Error string `json:"error"`
				}{Error: err.Error()})
				return
			}
		}

		Posts, err = GetPost(num, id, db)
		if err != nil {
			switch err {
			case sql.ErrNoRows:
				utils.WriteJSON(w, http.StatusOK, []models.Post{})
				return
			// case sqlite3.ErrLocked:
			// 	utils.WriteJSON(w, http.StatusLocked, struct {
			// 		Error string `json:"error"`
			// 	}{Error: "Database Locked"})
			// 	return
			}
			utils.WriteJSON(w, http.StatusInternalServerError, struct {
				Error string `json:"error"`
			}{Error: err.Error()})
			return
		}
		utils.WriteJSON(w, http.StatusOK, Posts)
	}
}
func GetPost(num, userID int, db *sql.DB) ([]models.Post, error) {
	start := ((num - 1) * models.PostsPerPage)
	total := 0
	err := Tablelen("post", &total, db)
	if err != nil {
		return nil, err
	}
	if total == 0 {
		return []models.Post{}, nil
	}
	if num-1 == (total/models.PostsPerPage)+(total%models.PostsPerPage) {
		start = models.PostsPerPage % total
	} else if num-1 > (total/models.PostsPerPage)+(total%models.PostsPerPage) {
		return []models.Post{}, nil
	}
	row, err := ExtractPosts(start, db)
	if err != nil {
		return nil, err
	}
	var posts []models.Post
	for row.Next() {
		var post models.Post

		err := row.Scan(&post.ID, &post.Title, &post.Content, &post.Created, &post.Author, &post.Likes, &post.Dislikes, &post.CommentsCount)
		if err != nil {
			return nil, err
		}
		post.IsLiked, post.IsDisliked = CheckIfLikedPost(post.ID, userID, db)

		post.Created = parseDate(post.Created)

		// Get categories
		// categories, err := GetPostCategories(post.ID)
		// if err != nil {
		// 	return nil, err
		// }

		// post.Categories = categories
		posts = append(posts, post)
	}
	if err := row.Err(); err != nil {
		return nil, err
	}
	return posts, nil
}
