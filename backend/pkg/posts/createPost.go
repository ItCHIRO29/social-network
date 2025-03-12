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
	// fmt.Println("CreatePost triggered")
	var first_name string
	var last_name string
	var author string
	var image string
	err := db.QueryRow("SELECT first_name , last_name,image FROM users WHERE id = ?", userId).Scan(&first_name, &last_name, &image)
	if err != nil {
		fmt.Println("error in GetUserData:", err)
		utils.WriteJSON(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	author = first_name + " " + last_name
	// fmt.Println("author:", author)
	post.Title = r.FormValue("title")
	post.Content = r.FormValue("content")
	post.Type = r.FormValue("privacy")
	post.Post_creator = author
	post.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	if post.Title == "" || post.Content == "" {
		utils.WriteJSON(w, http.StatusBadRequest, "Title and Content are required")
		return
	}
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
	// fmt.Println("post.Image:", post.Image)
	post.UserID = userId
	// fmt.Println("post::::::::", post)
	query = "INSERT INTO posts (user_id, title, content, created_at, image, privacy) VALUES ( ?, ?, ?, ?,?, ?)"
	_, err1 := db.Exec(query, post.UserID, Title, Content, createdAt, post.Image, post.Type)
	if err1 != nil {
		fmt.Println("error in db.Exec:", err1)
		utils.WriteJSON(w, http.StatusInternalServerError, "Error inserting post: "+err1.Error())
		return
	}
	query1 := "SELECT id FROM posts WHERE user_id = ? ORDER BY id DESC LIMIT 1"
	err2 := db.QueryRow(query1, userId).Scan(&post.ID)
	if err2 != nil {
		fmt.Println("error in db.QueryRow:", err2)
		utils.WriteJSON(w, http.StatusInternalServerError, "Error inserting post: "+err2.Error())
		return
	}
	post.ProfileImage = strings.Trim(image, "./")
	// fmt.Println("post:", post)
	utils.WriteJSON(w, http.StatusOK, post)
}
