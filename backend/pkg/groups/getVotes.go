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
	fmt.Println("VOTES :::::", votes)
	utils.WriteJSON(w, 200, votes)
}

func InsertVote(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var vote models.Event_members
	action := r.URL.Query().Get("action")
	fmt.Println("action : ", action)
	// fmt.Println("vote1111111 : ", vote)
	// return
	if action != "going" {
		err := json.NewDecoder(r.Body).Decode(&vote.EventID)
		if err != nil {
			fmt.Println("error in remove vote1 : ", err)
			utils.WriteJSON(w, 400, "bad request")
			return
		}
		var exists bool
		err = db.QueryRow("SELECT id FROM event_members WHERE user_id = ? AND event_id = ? AND (going = 0)", userId, vote.EventID).Scan(&exists)
		if err == sql.ErrNoRows {
			err = db.QueryRow("SELECT id FROM event_members WHERE user_id = ? AND event_id = ? AND going = 1 ", userId, vote.EventID).Scan(&exists)
			if err != sql.ErrNoRows {
				_, err = db.Exec("DELETE FROM event_members WHERE user_id = ? AND event_id = ? AND going = 1 ", userId, vote.EventID)
				if err != nil {
					utils.WriteJSON(w, http.StatusInternalServerError, "Error deleting from votes")
					return
				}
			}
			_, err = db.Exec("INSERT INTO event_members (user_id, event_id, going) VALUES (?, ?, ?)", userId, vote.EventID, 0)
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, "Error inserting into votes")
				return
			}
		} else {
			_, err = db.Exec("DELETE FROM event_members WHERE user_id = ? AND event_id = ? AND going = 1 ", userId, vote.EventID)
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, "Error deleting from votes")
				return
			}
		}
		vote.UserID = userId
		utils.WriteJSON(w, 200, vote)
		return
	} else {
		err := json.NewDecoder(r.Body).Decode(&vote.EventID)
		fmt.Println("voteXXXXXX : ", vote)
		var exists bool
		err = db.QueryRow("SELECT id FROM event_members WHERE user_id = ? AND event_id = ? AND (going = 1)", userId, vote.EventID).Scan(&exists)
		if err == sql.ErrNoRows {
			err = db.QueryRow("SELECT id FROM event_members WHERE user_id = ? AND event_id = ? AND going = 0 ", userId, vote.EventID).Scan(&exists)
			if err != sql.ErrNoRows {
				_, err = db.Exec("DELETE FROM event_members WHERE user_id = ? AND event_id = ? AND going = 0 ", userId, vote.EventID)
				if err != nil {
					utils.WriteJSON(w, http.StatusInternalServerError, "Error deleting from votes")
					return
				}
			}
			_, err = db.Exec("INSERT INTO event_members (user_id, event_id, going) VALUES (?, ?, ?)", userId, vote.EventID, 1)
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, "Error inserting into votes")
				return
			}
		} else {
			_, err = db.Exec("DELETE FROM event_members WHERE user_id = ? AND event_id = ? AND going = 1 ", userId, vote.EventID)
			if err != nil {
				utils.WriteJSON(w, http.StatusInternalServerError, "Error deleting from votes")
				return
			}
		}
		vote.UserID = userId
		utils.WriteJSON(w, 200, vote)
	}
}
