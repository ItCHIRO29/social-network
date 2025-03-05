package comments

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func CreateComment(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var coment models.Comment
	err := json.NewDecoder(r.Body).Decode(&coment)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		return
	}
	if coment.Content == "" {
		utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Content is required"})
		return
	}

	coment.AuthorID = userId
	coment.CreatedAt = time.Now().Format("2006-01-02 15:04:05")

	err = db.QueryRow("SELECT group_id FROM posts WHERE id = ?", coment.PostID).Scan(&coment.Group_id)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteJSON(w, http.StatusNotFound, map[string]string{"error": "Post not found"})
			return
		}
		fmt.Printf("Error fetching group_id: %v\n", err)
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
		return
	}

	stmt, err := db.Prepare("INSERT INTO comments (content, group_id, post_id, user_id, created_at, image) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		fmt.Printf("Error preparing statement: %v\n", err)
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(coment.Content, coment.Group_id, coment.PostID, coment.AuthorID, coment.CreatedAt, coment.Image)
	if err != nil {
		fmt.Printf("Error executing statement: %v\n", err)
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create comment"})
		return
	}

	utils.WriteJSON(w, http.StatusCreated, map[string]string{"message": "Comment created successfully"})
}
