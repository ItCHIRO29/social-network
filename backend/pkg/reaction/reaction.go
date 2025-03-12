package reaction

import (
	"database/sql"
	"encoding/json"
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
	err = InsertReaction(db, &reaction, userId)
	if err != nil {
		log.Println(err)
		utils.WriteJSON(w, http.StatusBadRequest, "bad request")
		return
	}
	


	w.WriteHeader(http.StatusCreated)
}
