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
	// var group_id int
	// err := db.QueryRow("SELECT id FROM groups WHERE name = ?", group_name).Scan(&group_id)
	query := `
        SELECT g.id, g.name, g.description, 
			gm.id, gm.user_id, gm.group_id, gm.accepted,
            e.id, e.group_id, e.title, e.description ,e.date
        FROM groups g
        LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.accepted = 1
        LEFT JOIN events e ON (g.id = e.group_id)
        WHERE g.name = ?`
	rows, err := db.Query(query, group_name)
	if err != nil {
		fmt.Println("Error getting groups", err)
		http.Error(w, "internal server error", 500)
		return
	}
	defer rows.Close()
	var group models.Group
	events := []models.Event{}
	members := []models.Member{}
	for rows.Next() {
		var event models.Event
		var member models.Member
		rows.Scan(&group.Id, &group.Name, &group.Description,
			&member.Id, &member.User_id, &member.Group_id, &member.Accepted,
			&event.ID, &event.GroupId, &event.Title, &event.Description, &event.ID,
		)
		member.Username = utils.GetUserName(db, member.User_id)
		members = append(members, member)
		events = append(events, event)
	}
	group.Events = events
	group.Members = members
	fmt.Println(" group Data : ", group)
	utils.WriteJSON(w, 200, group)
}
