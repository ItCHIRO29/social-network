package comments

import (
	"database/sql"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func ParseCommentForm(r *http.Request) (models.Comment, error) {
	var comment models.Comment
	var err error
	comment.Content = r.FormValue("text")
	comment.PostID, err = strconv.Atoi(r.FormValue("postid"))
	if err != nil {
		return comment, err
	}
	comment.Image, err = utils.ValidateAndSaveImage(r, "comment", fmt.Sprintf("%s%d", string(comment.CreatedAt), rand.Intn(100)))
	if err != nil {
		return comment, err
	}
	return comment, nil
}

func CreateComment(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	comment, err := ParseCommentForm(r)
	if err != nil {
		fmt.Printf("Error parsing form: %v\n", err)
		utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid input"})
		return
	}
	if (len(strings.TrimSpace(comment.Content)) == 0 && comment.Image == "") || (len(strings.TrimSpace(comment.Content)) > 2500 && comment.Image == "") {
		utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Content is required"})
		return
	}

	comment.AuthorID = userId
	comment.AuthorName, err = utils.GetFullNameFromId(db, userId)
	if err != nil {
		fmt.Printf("Error fetching author name: %v\n", err)
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
		return
	}
	comment.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	query := "INSERT INTO comments (content, post_id, user_id, created_at, image) VALUES (?, ?, ?, ?, ?) RETURNING id"
	err = db.QueryRow(query, comment.Content, comment.PostID, comment.AuthorID, comment.CreatedAt, comment.Image).Scan(&comment.ID)
	if err != nil {
		fmt.Printf("Error executing statement: %v\n", err)
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create comment"})
		return
	}
	utils.WriteJSON(w, http.StatusCreated, comment)
}
