package groups

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetMyGroups(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	// fmt.Println("Get groups")
	// rows, err := db.Query("SELECT g.id, g.name, g.description FROM groups g JOIN group_members gm on g.id = gm.group_id  WHERE (gm.user_id = 1; AND gm.accepted = 1)", userId)
	// rows, err := db.Query("SELECT * FROM groups")
	rows, err := db.Query(`
    SELECT g.* 
    FROM groups g
    LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.accepted = 1
    WHERE g.admin_id = ? OR gm.user_id = ?`, userId, userId)
	if err != nil {
		fmt.Println("Error getting groups", err)
		http.Error(w, "internal server error", 500)
		return
	}
	defer rows.Close()

	var AllGroups []models.Groups
	for rows.Next() {
		var group models.Groups
		var adminId int
		err = rows.Scan(&group.Id, &adminId, &group.Name, &group.Description)
		if err != nil {
			fmt.Println("Error getting groups ==>", err)
			http.Error(w, "internal server error", 500)
			return
		}
		AllGroups = append(AllGroups, group)
	}
	fmt.Println("groups ==>I", AllGroups)
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
	var AllGroups []models.Groups
	for rows.Next() {
		var group models.Groups
		var adminId int
		err = rows.Scan(&group.Id, &adminId, &group.Name, &group.Description)
		if err != nil {
			fmt.Println("Error getting groups ==>", err)
			http.Error(w, "internal server error", 500)
			return
		}
		AllGroups = append(AllGroups, group)
	}

	fmt.Println("groups Not joined ==>", AllGroups)
	utils.WriteJSON(w, 200, AllGroups)
}

// `http://localhost:8080/api/groups/groupActivity?group=${group_name}

func GetGroupActivity(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	fmt.Println("Get One group activity")

	group_name := r.URL.Query().Get("group")
	fmt.Println("Group name:", group_name)

	// Validate input
	if group_name == "" {
		http.Error(w, "Missing group name", http.StatusBadRequest)
		return
	}

	// Query to get group details with members and events
	query := `
	SELECT 
    g.id, g.name, g.description,
    COALESCE(e.id, 0), COALESCE(e.group_id, 0), COALESCE(e.title, ''), COALESCE(e.description, ''),
    COALESCE(m.id, 0), COALESCE(m.user_id, 0), COALESCE(m.group_id, 0), COALESCE(m.accepted, 0)
	FROM groups g
	LEFT JOIN events e ON g.id = e.group_id
	LEFT JOIN group_members m ON g.id = m.group_id AND m.accepted = 1
	WHERE g.name = ?;
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

	// Process rows
	var event models.Event
	for rows.Next() {
		var member models.Member
		err := rows.Scan(&group.Id, &group.Name, &group.Description,
			&event.EventID, &event.GroupId, &event.Title, &event.Description,
			&member.Id, &member.User_id, &member.Group_id, &member.Accepted,
		)
		if err != nil {
			fmt.Println("Error scanning row:", err)
			continue
		}
		if member.Id != 0 {
			member.Username = utils.GetUserName(db, member.User_id)
			group.Members = append(group.Members, member)
		}
	}
	// Avoid adding empty event/member records
	if event.EventID != 0 {
		group.Events = append(group.Events, event)
	}
	
	// Check for errors after looping
	if err := rows.Err(); err != nil {
		fmt.Println("Error iterating rows:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// If no group data was found
	if group.Id == 0 {
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}
	fmt.Println("Group Data:", group)
	fmt.Println("Group Events:", group.Events)
	fmt.Println("Group Members:", group.Members)
	utils.WriteJSON(w, http.StatusOK, group)
}
