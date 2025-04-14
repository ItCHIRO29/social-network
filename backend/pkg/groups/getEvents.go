package groups

// func GetEvents(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
// 	eventId := r.URL.Query().Get("id")
// 	if eventId != "" {
// 		var event models.Event
// 		query := `SELECT * FROM events WHERE id = ?`
// 		err := db.QueryRow(query, eventId).Scan(&event)
// 		if err != nil {
// 			fmt.Println("error decoding json")
// 			utils.WriteJSON(w, 400, "bad request")
// 			return
// 		}
// 		utils.WriteJSON(w, 200, event)
// 	}
// 	var Groups models.Event
// 	err := json.NewDecoder(r.Body).Decode(&Groups)
// 	if err != nil {
// 		fmt.Println("error decoding json")
// 		utils.WriteJSON(w, 400, "bad request")
// 		return
// 	}
// 	rows, err := db.Query(`SELECT
//     e.id,
//     e.creator_id,
//     e.title,
//     e.description,
// 	u.username,
// 	e.group_id,
// 	    COUNT(em.id) AS member_count
// 	FROM
// 	    events e
// 	JOIN
// 	    event_members em ON e.id = em.event_id
// 	JOIN
// 	    users u ON em.user_id = u.id
// 	WHERE
// 	    e.group_id = ?
// 	GROUP BY
// 	    e.id,e.title,e.description, em.user_id, e.group_id
// 	`, Groups.GroupId)
// 	if err != nil {
// 		http.Error(w, "internal server error", 500)
// 		return
// 	}
// 	defer rows.Close()

// 	var votes []models.Event
// 	for rows.Next() {
// 		var vote models.Event
// 		err = rows.Scan(&vote.EventID, &vote.UserID, &vote.Title, &vote.Description, &vote.Username, &vote.GroupId, &vote.Going)
// 		if err != nil {
// 			http.Error(w, "internal server error", 500)
// 			return
// 		}
// 		votes = append(votes, vote)
// 	}
// 	utils.WriteJSON(w, 200, votes)
// }
