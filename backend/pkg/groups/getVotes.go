package groups

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetVotes(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var Groups models.Event_members
	err := json.NewDecoder(r.Body).Decode(&Groups)
	if err != nil {
		utils.WriteJSON(w, 400, "bad request")
		return
	}
	rows, err := db.Query("SELECT vm.id, vm.user_id, vm.event_id, vm.going , u.username, e.group_id FROM event_members vm JOIN events e on vm.event_id = e.id JOIN users u on vm.user_id = u.id WHERE vm.event_id = ?", Groups.EventID)
	if err != nil {
		http.Error(w, "internal server error", 500)
		return
	}
	defer rows.Close()

	var votes []models.Event_members
	for rows.Next() {
		var vote models.Event_members
		err = rows.Scan(&vote.ID, &vote.UserID, &vote.EventID, &vote.Going, &vote.UserName, &vote.Group_id)
		if err != nil {
			http.Error(w, "internal server error", 500)
			return
		}
		votes = append(votes, vote)
	}
	utils.WriteJSON(w, 200, votes)
}

func InsertVote(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var vote models.Event_members
	action := r.URL.Query().Get("action")

	if action != "going" {
		err := json.NewDecoder(r.Body).Decode(&vote)
		if err != nil {
			fmt.Println("error in remove vote1 : ", err)
			utils.WriteJSON(w, 400, "bad request")
			return
		}
		_, err = db.Exec("DELETE FROM event_members WHERE user_id = ? AND event_id = ?", userId, vote.EventID)
		if err != nil {
			fmt.Println("error in remove vote2 : ", err)
			http.Error(w, "internal server error", 500)
			return
		}
		utils.WriteJSON(w, 200, vote.Going)
		return
	} else {
		err := json.NewDecoder(r.Body).Decode(&vote)
		if err != nil {
			fmt.Println("error in insert vote1 : ", err)
			utils.WriteJSON(w, 400, "bad request")
			return
		}
		var currentGoing bool
		err = db.QueryRow("SELECT going FROM event_members WHERE user_id = ? AND event_id = ?", userId, vote.EventID).Scan(&currentGoing)
		if err != nil {
			if err == sql.ErrNoRows {
				_, err = db.Exec("INSERT INTO event_members (user_id, event_id, going) VALUES (?, ?, ?)", userId, vote.EventID, true)
				if err != nil {
					fmt.Println("error in insert vote2 : ", err)
					http.Error(w, "internal server error", 500)
					return
				}
			} else {
				_, err = db.Exec("UPDATE event_members SET going = ? WHERE user_id = ? AND event_id = ?", vote.Going, userId, vote.EventID)
				if err != nil {
					fmt.Println("error in insert vote3 : ", err)
					http.Error(w, "internal server error", 500)
					return
				}
			}
			utils.WriteJSON(w, 200, vote.Going)
			return
		}
	}
}
