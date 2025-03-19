package groups

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetEvents(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var Groups models.Event
	err := json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
	// page, err := strconv.Atoi(r.URL.Query().Get("page"))
	// if err != nil {
	// 	utils.WriteJSON(w, 400, "bad request")
	// 	return
	// }
	// 	rows, err := db.Query(`SELECT
	//     e.id,
	//     e.creator_id,
	//     e.title,
	//     e.description,
	// u.username,
	//     e.group_id,
	//     COUNT(em.id) AS member_count
	// FROM
	//     events e

	// JOIN
	//
	//	event_members em ON e.id = em.event_id
	//
	// JOIN
	//
	//	users u ON em.user_id = u.id
	//
	// WHERE
	//
	//	e.group_id = ?
	//
	// GROUP BY
	//
	//	e.id,e.title,e.description, em.user_id, e.group_id
	//
	// LIMIT 30 OFFSET ?`, Groups.GroupId, (page-1)*30)
	rows, err := db.Query(`SELECT 
    e.id, 
    e.creator_id,
    e.title,
    e.description,
	u.username,
	e.group_id, 
	    COUNT(em.id) AS member_count 
	FROM 
	    events e 
	JOIN 
	    event_members em ON e.id = em.event_id
	JOIN 
	    users u ON em.user_id = u.id
	WHERE
	    e.group_id = ?
	GROUP BY 
	    e.id,e.title,e.description, em.user_id, e.group_id
	`, Groups.GroupId)
	if err != nil {
		http.Error(w, "internal server error", 500)
		return
	}
	defer rows.Close()

	var votes []models.Event
	for rows.Next() {
		var vote models.Event
		err = rows.Scan(&vote.EventID, &vote.UserID, &vote.Title, &vote.Description, &vote.Username, &vote.GroupId, &vote.Count)
		if err != nil {
			http.Error(w, "internal server error", 500)
			return
		}
		votes = append(votes, vote)
	}
	utils.WriteJSON(w, 200, votes)
}
