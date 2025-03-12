package groups

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func CreateEvent(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var Event models.Event
	err := json.NewDecoder(r.Body).Decode(&Event)
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
	err = InsertNewEvent(&Event, userId, db, r)
	if err != nil {
		if err.Error() == "invalid Name length" {
			utils.WriteJSON(w, 400, "invalid Name length")
			return
		} else if err.Error() == "invalid Description length" {
			utils.WriteJSON(w, 400, "invalid Description length")
			return
		}
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
}

func InsertNewEvent(Event *models.Event, userId int, Db *sql.DB, r *http.Request) error {
	if len(Event.Title) < 3 || len(Event.Title) > 15 {
		return errors.New("invalid Name length")
	} else if len(Event.Description) < 1 || len(Event.Description) > 500 {
		return errors.New("invalid Description length")
	}

	return Db.QueryRow("INSERT INTO events (group_id, creator_id, title,description) VALUES (?, ?, ?)", Event.GroupId ,userId, Event.Title, Event.Description).Err()
}
