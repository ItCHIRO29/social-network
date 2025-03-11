package posts

import (
	"database/sql"
	"fmt"
	"html"
	"net/http"
	"strconv"
	"strings"
	"time"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

var GroupPost models.Posts

func CreateGroupPost(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	// fmt.Println("CreatePost triggered")
	group_id_str := r.URL.Query().Get("groupId")
	group_id, errr := strconv.Atoi(group_id_str)
	if errr != nil {
		fmt.Println("error in CreateGroupPost:", errr)
		utils.WriteJSON(w, http.StatusBadRequest, "Invalid group ID")
		return
	}
	fmt.Println("group_id:", group_id)
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
	GroupPost.Title = r.FormValue("title")
	GroupPost.Content = r.FormValue("content")
	// GroupPost.Type = r.FormValue("privacy")
	GroupPost.Post_creator = author
	GroupPost.GroupId = group_id
	GroupPost.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	if GroupPost.Title == "" || GroupPost.Content == "" {
		utils.WriteJSON(w, http.StatusBadRequest, "Title and Content are required")
		return
	}
	fmt.Println("GroupPost:", GroupPost)
	// if len(strings.TrimSpace(GroupPost.Title)) < 10 || len(strings.TrimSpace(GroupPost.Content)) < 10 {
	// 	utils.WriteJSON(w, http.StatusBadRequest, "Title and Content should be at least 10 characters long")
	// 	return
	// }
	createdAt := time.Now().Format("2006-01-02 15:04:05")
	Title := strings.TrimSpace(html.EscapeString(GroupPost.Title))
	Content := strings.TrimSpace(html.EscapeString(GroupPost.Content))
	// GroupPost.Type = strings.ToLower(GroupPost.Type)
	query := ""
	str := strings.Trim(createdAt, " ")
	GroupPost.Image, _ = utils.ValidateAndSaveImage(r, "GroupPost", str+author)
	GroupPost.UserID = userId
	GroupPost.GroupId = group_id
	fmt.Println("GroupPost.Image:", GroupPost.Image)
	fmt.Println("UserID:", GroupPost.UserID)
	fmt.Println("GroupPost:", GroupPost.GroupId)
	query = "INSERT INTO posts (user_id,group_id, title, content, created_at, image) VALUES ( ?, ?, ?, ?,?, ?)"
	_, err1 := db.Exec(query, GroupPost.UserID, GroupPost.GroupId, Title, Content, createdAt, GroupPost.Image)
	if err1 != nil {
		fmt.Println("error in inserting post:", err1)
		utils.WriteJSON(w, http.StatusInternalServerError, "Error inserting GroupPost: "+err1.Error())
		return
	}
	query1 := "SELECT id FROM posts WHERE user_id = ? ORDER BY id DESC LIMIT 1"
	err2 := db.QueryRow(query1, userId).Scan(&GroupPost.ID)
	if err2 != nil {
		fmt.Println("error in db.QueryRow:", err2)
		utils.WriteJSON(w, http.StatusInternalServerError, "Error inserting GroupPost: "+err2.Error())
		return
	}
	GroupPost.ProfileImage = strings.Trim(image, "./")
	fmt.Println("GroupPost ========>", GroupPost)
	utils.WriteJSON(w, http.StatusOK, GroupPost)
}
