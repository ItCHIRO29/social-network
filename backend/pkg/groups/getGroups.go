package groups

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"social-network/pkg/models"
	"social-network/pkg/posts"
	"social-network/pkg/utils"
)

func GetJoinedGroups(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		return
	}
	rows, err := db.Query(`
    SELECT g.*  
    FROM groups g
    LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.accepted = 1
    WHERE gm.user_id = $1 AND g.admin_id != $1
	ORDER BY g.name LIMIT ? OFFSET ?`, userId, utils.Limit, utils.Limit*page)
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
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		return
	}
	query := `
    SELECT g.*
    FROM groups g
	WHERE g.admin_id != ? AND g.id NOT IN (
		SELECT group_id FROM group_members WHERE user_id = ?
	) ORDER BY g.name 
	 LIMIT ? OFFSET ?`
	rows, err := db.Query(query, userId, userId, utils.Limit, utils.Limit*page)
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

func GetGroupActivity(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	// fmt.Println("GetGroupActivity!!!!!!!!!!!!!!!!!!!!!!!!!")
	group_name := r.URL.Query().Get("group")
	if group_name == "" {
		http.Error(w, "Missing group name", http.StatusBadRequest)
		return
	}
	// fmt.Println("group_name ===>", group_name)
	temp := `SELECT groups.id FROM groups WHERE name = ?`
	var group_id int
	err := db.QueryRow(temp, group_name).Scan(&group_id)
	if err != nil {
		fmt.Println("Error getting group ID:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	// fmt.Println("group_id ===>", group_id)
	// if group_name == "" {
	// http.Error(w, "Missing group name", http.StatusBadRequest)
	// return
	// }
	isMem := posts.IsMember(db, group_id, userId)
	if !isMem {
		http.Error(w, "You are not a member of this group", http.StatusUnauthorized)
		return
	}
	query := `
	SELECT
    g.id, g.name, g.description,
    COALESCE(m.id, 0), COALESCE(m.user_id, 0), COALESCE(m.group_id, 0), COALESCE(m.accepted, 0)
	FROM groups g
	LEFT JOIN events e ON g.id = e.group_id
	LEFT JOIN group_members m ON g.id = m.group_id AND m.accepted = 1
	WHERE g.name = ?
	GROUP BY g.id, e.id, m.id;
	`

	rows, err := db.Query(query, group_name)
	if err != nil {
		fmt.Println("Error getting group data:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var group models.Group
	group.Events = []models.Event{}
	group.Members = []models.Member{}

	// Maps to track unique events and members
	// eventMap := make(map[int]bool)
	memberMap := make(map[int]bool)

	for rows.Next() {
		// var event models.Event
		var member models.Member

		err := rows.Scan(&group.Id, &group.Name, &group.Description,
			// &event.EventID, &event.GroupId, &event.Title, &event.Description,
			&member.Id, &member.User_id, &member.Group_id, &member.Accepted,
			// &event.Count, &event.Going,
		)
		if err != nil {
			fmt.Println("Error scanning row:", err)
			continue
		}
		// Add unique events
		// if event.EventID != 0 && !eventMap[event.EventID] {
		// 	event.Going, err = CheckVote(db, userId, event.EventID)
		// 	if err != nil {
		// 		fmt.Println("Error getting vote:", err)
		// 		continue
		// 	}
		// 	group.Events = append(group.Events, event)
		// 	eventMap[event.EventID] = true
		// }

		// Add unique members
		if member.Id != 0 && !memberMap[member.Id] {
			member.Username, err = utils.GetFullNameFromId(db, member.User_id)
			if err != nil {
				fmt.Println("Error getting username:", err)
				continue
			}
			group.Members = append(group.Members, member)
			memberMap[member.Id] = true
		}
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error iterating rows:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// If no group found
	if group.Id == 0 {
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}
	// fmt.Println("Group data:", group)
	utils.WriteJSON(w, http.StatusOK, group)
}

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
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		return
	}
	query := `SELECT * FROM groups WHERE admin_id = ? ORDER BY name LIMIT ? OFFSET ?`
	group := models.Group{}
	rows, err := db.Query(query, userId, utils.Limit, utils.Limit*page)
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

func LeaveGrp(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	groupId := r.URL.Query().Get("groupId")
	query := `DELETE FROM group_members where (group_id = ? AND user_id= ?)`
	_, err := db.Exec(query, groupId, userId)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, nil)
		fmt.Println(err)
		return
	}

	utils.WriteJSON(w, http.StatusAccepted, nil)
}
