package reaction

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func CreateReaction(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {

	var reaction models.Reaction
	err := json.NewDecoder(r.Body).Decode(&reaction)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = checkReaction(db, &reaction, userId)
	if err != nil {
		log.Println(err)
		utils.WriteJSON(w, http.StatusBadRequest, "bad request")
		return
	}
	err = InsertReaction(db, &reaction, userId)
	if err != nil {
		log.Println(err)
		utils.WriteJSON(w, http.StatusBadRequest, "bad request")
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func checkReaction(db *sql.DB, reaction *models.Reaction, userId int) error {
	if reaction.PostID <= 0 || reaction.GroupID < 0 {
		return fmt.Errorf("PostID or GroupID is missing")
	}
	check := true
	if reaction.GroupID != 0 {
		db.QueryRow("SELECT EXISTS(SELECT id FROM posts WHERE id = ? AND group_id = ?)", reaction.PostID, reaction.GroupID).Scan(&check)
		if !check {
			return fmt.Errorf("Post does not exist")
		}
	} else {
		db.QueryRow("SELECT EXISTS(SELECT id FROM posts WHERE id = ? AND group_id IS NULL)", reaction.PostID).Scan(&check)
		if !check {
			return fmt.Errorf("Post does not exist")
		}
	}

	return nil
}
