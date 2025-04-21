package groups

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"social-network/pkg/models"
	"social-network/pkg/notifications"
	"social-network/pkg/utils"
)

func CreateEvent(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var Event models.Event
	if r.Method == "POST" {
		err := json.NewDecoder(r.Body).Decode(&Event)
		if err != nil {
			fmt.Println("Error decoding request body", err)
			utils.WriteJSON(w, 400, "bad request")
			return
		}
		if len(Event.Title) < 3 || len(Event.Title) > 15 {
			fmt.Println("Error decoding request body", err)
			utils.WriteJSON(w, 400, "invalid Title length")
			return
		} else if len(Event.Description) < 1 || len(Event.Description) > 500 {
			utils.WriteJSON(w, 400, "invalid Description length")
			return
		}
		Event.GroupId, err = GetGroupID(db, Event.GroupName)
		if err != nil {
			fmt.Println("Error getting group id", err)
			utils.WriteJSON(w, 500, "internal server error")
			return
		}
		var eventId int
		tx, err := db.Begin()
		if err != nil {
			fmt.Println("Error beginning transaction", err)
			utils.WriteJSON(w, 500, "internal server error")
			return
		}
		eventTime, err := time.Parse(time.RFC3339, Event.Date)
		if err != nil {
			fmt.Println("Error parsing event date:", err)
			return
		}

		now := time.Now().UTC()

		if eventTime.Before(now) {
			utils.WriteJSON(w, 400, "Choose a future date!")
			return
		}

		err = tx.QueryRow("INSERT INTO events (group_id, creator_id, title,description, date) VALUES (?, ?, ?, ?, ?) RETURNING id", Event.GroupId, userId, Event.Title, Event.Description, Event.Date).Scan(&eventId)
		if err != nil {
			tx.Rollback()
			fmt.Println("Error creating event", err)
			utils.WriteJSON(w, 500, "internal server error")
			return
		}

		getGroupNameQuery := `SELECT name FROM groups WHERE id = ?`
		var groupName string
		err = tx.QueryRow(getGroupNameQuery, Event.GroupId).Scan(&groupName)
		if err != nil {
			fmt.Println("Error getting group name", err)
			utils.WriteJSON(w, 500, "internal server error")
			return
		}
		additionalData := map[string]any{"group_name": groupName}
		notifications.SendGroupNotification(tx, db, userId, Event.GroupId, "event", eventId, additionalData)
		err = tx.Commit()
		if err != nil {
			fmt.Println("Error committing transaction", err)
			utils.WriteJSON(w, 500, "internal server error")
			return
		}
		utils.WriteJSON(w, 200, "event created successfully")
		return
	}
	// Method Get to get events data
	groupName := r.URL.Query().Get("group")
	if groupName == "" {
		utils.WriteJSON(w, 400, "invalid group name")
		return
	}
	eventId := r.URL.Query().Get("id")
	if eventId != "" {
		fmt.Println("eventId and it's data from here", eventId)
		var event models.Event
		query := `SELECT 
   	COALESCE(e.id, 0), 
	COALESCE(e.group_id, 0),
	COALESCE(e.title, ''),
	COALESCE(e.description, ''),
	COALESCE(e.date, ''),
	COALESCE(g.name, '') AS group_name,
		COALESCE(SUM(CASE WHEN em.going = 1 THEN 1 ELSE 0 END), 0) AS going_count,
		COALESCE(SUM(CASE WHEN em.going = 0 THEN 1 ELSE 0 END), 0) AS not_going_count
	FROM events e
	JOIN groups g ON g.id = e.group_id
	LEFT JOIN event_members em ON em.event_id = e.id
	WHERE  g.name = ? AND e.id = ? AND datetime(e.date) > datetime('now')`

		err := db.QueryRow(query, groupName, eventId).Scan(&event.EventID, &event.GroupId, &event.Title, &event.Description, &event.Date, &event.GroupName, &event.GoingCount, &event.NotGoingCount)
		if err != nil {
			if err == sql.ErrNoRows {
				utils.WriteJSON(w, 400, "bad request")
				return
			}
			fmt.Println("error ", err)
			utils.WriteJSON(w, 500, "Internal server")
			return
		}
		utils.WriteJSON(w, 200, event)
		return
	}
	var err1 error
	Event.GroupId, err1 = GetGroupID(db, groupName)
	if err1 != nil {
		fmt.Println("Error getting group id", err1)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
	query := `
	SELECT 
		COALESCE(e.id, 0), 
		e.group_id, 
		e.creator_id,
		e.title, 
		e.description, 
		e.date,
		SUM(CASE WHEN em.going = 1 THEN 1 ELSE 0 END) AS going_count,
		SUM(CASE WHEN em.going = 0 THEN 1 ELSE 0 END) AS not_going_count
	FROM events e
	LEFT JOIN event_members em ON e.id = em.event_id 
	WHERE e.group_id = ? AND datetime(e.date) > datetime('now')
	GROUP BY e.id
`
	rows, err := db.Query(query, Event.GroupId)
	if err != nil {
		fmt.Println("Error getting events", err)
		utils.WriteJSON(w, 500, "internal server error")
		return
	}
	defer rows.Close()
	var Events []models.Event
	for rows.Next() {
		var Event models.Event
		err = rows.Scan(&Event.EventID, &Event.GroupId, &Event.UserID, &Event.Title, &Event.Description, &Event.Date, &Event.GoingCount, &Event.NotGoingCount)
		if err != nil {
			fmt.Println("Error getting events", err)
			utils.WriteJSON(w, 500, "internal server error")
			return
		}
		Events = append(Events, Event)
	}
	utils.WriteJSON(w, 200, Events)
}

func GetGroupID(db *sql.DB, groupName string) (int, error) {
	var groupID int
	err := db.QueryRow("SELECT id FROM groups WHERE name = ?", groupName).Scan(&groupID)
	if err != nil {
		return 0, err
	}
	return groupID, nil
}
