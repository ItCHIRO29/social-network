package posts

import (
	"database/sql"
	"fmt"
	"html"
	"net/http"
	"strings"
	"time"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

var post models.Posts

func CreatePost(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Println("CreatePost triggered")
	var author string
	err := db.QueryRow("SELECT username FROM users WHERE id = ?", userId).Scan(&author)
	if err != nil {
		fmt.Println("error in GetUserData:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	fmt.Println("author:", author)
	// err = json.NewDecoder(r.Body).Decode(&post)
	post.Title = r.FormValue("title")
	post.Content = r.FormValue("content")
	post.Type = r.FormValue("privacy")
	// post.Image = r.FormValue("image")
	if post.Title == "" || post.Content == "" {
		utils.WriteJSON(w, http.StatusBadRequest, "Title and Content are required")
		return
	}
	// if post.Type == "Public" {
	// 	post.Type = "0"
	// } else if post.Type == "Private" {
	// 	post.Type = "1"
	// } else if post.Type == "Friends" {
	// 	post.Type = "2"
	// } else {
	// 	utils.WriteJSON(w, http.StatusBadRequest, "Invalid post type")
	// 	return
	// }
	// if len(strings.TrimSpace(post.Title)) < 10 || len(strings.TrimSpace(post.Content)) < 10 {
	// 	utils.WriteJSON(w, http.StatusBadRequest, "Title and Content should be at least 10 characters long")
	// 	return
	// }
	createdAt := time.Now().Format("2006-01-02 15:04:05")
	Title := strings.TrimSpace(html.EscapeString(post.Title))
	Content := strings.TrimSpace(html.EscapeString(post.Content))
	post.Type = strings.ToLower(post.Type)
	query := ""
	// if post.Image != "" {
	// post.Image = strings.TrimSpace(html.EscapeString(post.Image))
	// strID := strconv.Itoa(post.ID)
	str := strings.Trim(createdAt, " ")
	post.Image, _ = utils.ValidateAndSaveImage(r, "post", str+author)
	fmt.Println("post.Image:", post.Image)
	// if err != nil && err.Error() != "no image" {
	// fmt.Fprintln(os.Stderr, "in ValidateAndSaveImage", err)
	// utils.WriteJSON(w, http.StatusBadRequest, err.Error())
	// return
	// }
	// post.GroupId = 1
	post.UserID = userId
	fmt.Println("post:::::::::", post)
	query = "INSERT INTO posts (user_id, title, content, created_at, image, privacy) VALUES ( ?, ?, ?, ?,?, ?)"
	_, err1 := db.Exec(query, post.UserID, Title, Content, createdAt, post.Image, post.Type)
	if err1 != nil {
		fmt.Println("error in db.Exec:", err1)
		utils.WriteJSON(w, http.StatusInternalServerError, "Error inserting post: "+err1.Error())
		return
	}
	fmt.Println("post:", post)
	utils.WriteJSON(w, http.StatusOK, "Post created successfully")
	// } else {
	// 	query = "INSERT INTO posts (user_id, title, content, created_at,privacy) VALUES (?, ?, ?, ?, ?)"
	// 	_, err1 := db.Exec(query, userId, Title, Content, createdAt, post.Type)
	// 	if err1 != nil {
	// 		fmt.Println("error in db.Exec:", err1)
	// 		utils.WriteJSON(w, http.StatusInternalServerError, "Error inserting post: "+err1.Error())
	// 		return
	// 	}
	// }
	// _, err1 := db.Exec(query, userId, Title, Content, createdAt, post.Type)
	// if err1 != nil {
	// 	fmt.Println("error in db.Exec:", err1)
	// 	utils.WriteJSON(w, http.StatusInternalServerError, "Error inserting post: "+err1.Error())
	// 	return
	// }
}
