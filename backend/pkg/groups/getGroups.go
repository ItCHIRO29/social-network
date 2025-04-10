package groups

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetJoinedGroups(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	rows, err := db.Query(`
    SELECT g.*  
    FROM groups g
    LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.accepted = 1
    WHERE gm.user_id = $1 AND g.admin_id != $1
	`, userId)
	if err != nil {
		fmt.Println("Error getting groups", err)
		http.Error(w, "internal server error", 500)
		return
	}
	defer rows.Close()

	AllGroups := make([]models.Group, 0)
	for rows.Next() {
		var group models.Group
		var adminId int
		err = rows.Scan(&group.Id, &adminId, &group.Name, &group.Description)
		if err != nil {
			fmt.Println("Error getting groups ==>", err)
			http.Error(w, "internal server error", 500)
			return
		}
		AllGroups = append(AllGroups, group)
	}
	utils.WriteJSON(w, 200, AllGroups)
}

func GetAllGroups(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	query := `
    SELECT g.*
    FROM groups g
	WHERE g.admin_id != ? AND g.id NOT IN (
		SELECT group_id FROM group_members WHERE user_id = ?
	)`
	rows, err := db.Query(query, userId, userId)
	if err != nil {
		fmt.Println("Error getting groups", err)
		http.Error(w, "internal server error", 500)
		return
	}
	defer rows.Close()
	AllGroups := make([]models.Group, 0)
	for rows.Next() {
		var group models.Group
		var adminId int
		err = rows.Scan(&group.Id, &adminId, &group.Name, &group.Description)
		if err != nil {
			fmt.Println("Error getting groups ==>", err)
			http.Error(w, "internal server error", 500)
			return
		}
		AllGroups = append(AllGroups, group)
	}

	utils.WriteJSON(w, 200, AllGroups)
}

// `http://localhost:8080/api/groups/groupActivity?group=${group_name}

// func GetGroupActivity(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
// 	group_name := r.URL.Query().Get("group")

// 	if group_name == "" {
// 		http.Error(w, "Missing group name", http.StatusBadRequest)
// 		return
// 	}

// 	query := `
// 	SELECT
//     g.id, g.name, g.description,
//     COALESCE(e.id, 0), COALESCE(e.group_id, 0), COALESCE(e.title, ''), COALESCE(e.description, ''),
//     COALESCE(m.id, 0), COALESCE(m.user_id, 0), COALESCE(m.group_id, 0), COALESCE(m.accepted, 0),
// 	COUNT(em.id) ,
// 	 em.going NOT NULL
// 	FROM groups g
// 	LEFT JOIN events e ON g.id = e.group_id
// 	LEFT JOIN group_members m ON g.id = m.group_id AND m.accepted = 1
// 	LEFT JOIN event_members em ON e.id = em.event_id
// 	WHERE g.name = ?
// 	GROUP BY g.id, e.id, m.id;
// 	`

// 	rows, err := db.Query(query, group_name)
// 	if err != nil {
// 		fmt.Println("Error getting group data:", err)
// 		http.Error(w, "Internal server error", http.StatusInternalServerError)
// 		return
// 	}
// 	defer rows.Close()

// 	var group models.Group
// 	group.Events = []models.Event{}
// 	group.Members = []models.Member{}

// 	// Maps to track unique events and members
// 	eventMap := make(map[int]bool)
// 	memberMap := make(map[int]bool)

// 	for rows.Next() {
// 		var event models.Event
// 		var member models.Member

// 		err := rows.Scan(&group.Id, &group.Name, &group.Description,
// 			&event.EventID, &event.GroupId, &event.Title, &event.Description,
// 			&member.Id, &member.User_id, &member.Group_id, &member.Accepted,
// 			&event.Count, &event.Going,
// 		)
// 		if err != nil {
// 			fmt.Println("Error scanning row:", err)
// 			continue
// 		}
// 		// Add unique events
// 		if event.EventID != 0 && !eventMap[event.EventID] {
// 			event.Going, err = CheckVote(db, userId, event.EventID)
// 			if err != nil {
// 				fmt.Println("Error getting vote:", err)
// 				continue
// 			}
// 			group.Events = append(group.Events, event)
// 			eventMap[event.EventID] = true
// 		}

// 		// Add unique members
// 		if member.Id != 0 && !memberMap[member.Id] {
// 			member.Username, err = utils.GetFullNameFromId(db, member.User_id)
// 			if err != nil {
// 				fmt.Println("Error getting username:", err)
// 				continue
// 			}
// 			group.Members = append(group.Members, member)
// 			memberMap[member.Id] = true
// 		}
// 	}

// 	if err := rows.Err(); err != nil {
// 		fmt.Println("Error iterating rows:", err)
// 		http.Error(w, "Internal server error", http.StatusInternalServerError)
// 		return
// 	}

// 	// If no group found
// 	if group.Id == 0 {
// 		http.Error(w, "Group not found", http.StatusNotFound)
// 		return
// 	}

// 	utils.WriteJSON(w, http.StatusOK, group)
// }

func CheckVote(db *sql.DB, userId int, eventId int) (bool, error) {
	Qyery := `SELECT going FROM event_members WHERE user_id = ? AND event_id = ?`
	rows, err := db.Query(Qyery, userId, eventId)
	if err != nil {
		fmt.Println("Error getting groups", err)
		return false, err
	}
	defer rows.Close()
	var going bool
	for rows.Next() {
		err = rows.Scan(&going)
		if err != nil {
			fmt.Println("Error getting groups ==>", err)
			return false, err
		}
	}
	return going, nil
}

func GetMyGroups(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	query := `SELECT * FROM groups WHERE admin_id = ?`
	group := models.Group{}
	rows, err := db.Query(query, userId)
	if err != nil {
		fmt.Println("Error getting groups", err)
		http.Error(w, "internal server error", 500)
		return
	}
	defer rows.Close()
	AllGroups := make([]models.Group, 0)
	for rows.Next() {
		err = rows.Scan(&group.Id, &group.AdminId, &group.Name, &group.Description)
		if err != nil {
			fmt.Println("Error getting groups ==>", err)
			http.Error(w, "internal server error", 500)
			return
		}
		AllGroups = append(AllGroups, group)
	}
	utils.WriteJSON(w, http.StatusAccepted, AllGroups)
}
