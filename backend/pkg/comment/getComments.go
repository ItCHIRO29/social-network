package comments

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetComments(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	post_id := r.URL.Query().Get("post_id")
	rows, err := db.Query("SELECT * FROM comments WHERE post_id = ? ORDER BY id DESC", post_id)
	if err != nil {
		fmt.Printf("Error fetching comments: %v\n", err)
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
		return
	}
	defer rows.Close()
	var comments []models.Comment
	for rows.Next() {
		var comment models.Comment
		var temp any
		err = rows.Scan(&comment.ID, &temp, &comment.AuthorID, &comment.PostID, &comment.Content, &comment.Image, &comment.CreatedAt)
		if err != nil {
			fmt.Printf("Error scanning comment: %v\n", err)
			utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
			return
		}
		comment.AuthorName, err = utils.GetFullNameFromId(db, comment.AuthorID)
		if err != nil {
			fmt.Printf("Error getting author name: %v\n", err)
			utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
			return
		}
		comments = append(comments, comment)
	}
	utils.WriteJSON(w, http.StatusOK, comments)
}
