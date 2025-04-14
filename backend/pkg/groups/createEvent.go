package groups

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func CreateEvent(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var Event models.Event
	if r.Method == "POST" {
		fmt.Println("CreateEvent METHOD POST")
		err := json.NewDecoder(r.Body).Decode(&Event)
		if err != nil {
			fmt.Println("Error decoding request body", err)
			utils.WriteJSON(w, 400, "bad request")
			return
		}
		// fmt.Println("Event from request :::", Event.Date)
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
		_, err = db.Exec("INSERT INTO events (group_id, creator_id, title,description, date) VALUES (?, ?, ?, ?, ?)", Event.GroupId, userId, Event.Title, Event.Description, Event.Date)
		if err != nil {
			fmt.Println("Error creating event", err)
			utils.WriteJSON(w, 500, "internal server error")
			return
		}
		return
	}
	groupName := r.URL.Query().Get("group")
	if groupName == "" {
		utils.WriteJSON(w, 400, "invalid group name")
		return
	}
	eventId := r.URL.Query().Get("id")
	if eventId != "" {
		var event models.Event
		query := `SELECT 
    e.id, 
    e.group_id, 
    e.title, 
    e.description, 
    e.date, 
    g.name AS group_name
FROM events e
JOIN groups g ON g.id = e.group_id
WHERE g.name = ? AND e.id = ?`
		err := db.QueryRow(query, groupName, eventId).Scan(&event.EventID, &event.GroupId, &event.Title, &event.Description, &event.Date, &event.GroupName)
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
	// query := `SELECT id, group_id, creator_id, title, description, date FROM events WHERE group_id = ?`
	query := `
	SELECT 
		e.id, 
		e.group_id, 
		e.creator_id, 
		e.title, 
		e.description, 
		e.date,
		SUM(CASE WHEN em.going = true THEN 1 ELSE 0 END) AS going_count,
		SUM(CASE WHEN em.going = false THEN 1 ELSE 0 END) AS not_going_count
	FROM events e
	LEFT JOIN event_members em ON e.id = em.event_id 
	WHERE e.group_id = ?
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
	// fmt.Println("Events", Events)
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

// func InsertNewEvent(Event *models.Event, userId int, Db *sql.DB, r *http.Request) error {
// 	fmt.Println("event in insert event", Event)

// 	return Db.QueryRow("INSERT INTO events (group_id, creator_id, title,description) VALUES (?, ?, ?)", Event.GroupId, userId, Event.Title, Event.Description).Err()
// }
