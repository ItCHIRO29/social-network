package reaction

import (
	"database/sql"
	"fmt"
	"log"
	"social-network/pkg/models"
)

// CreateReaction is a function that creates a reaction
func InsertReaction(db *sql.DB, reaction *models.Reaction, userId int) error {
	_, err := db.Exec("INSERT INTO reactions (user_id,post_id, group_id) VALUES (?,?, ?)", userId, reaction.PostID, reaction.GroupID)
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}
