package groups

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetMyGroups(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	//fmt.Println("Get groups")
	// rows, err := db.Query("SELECT g.id, g.name, g.description FROM groups g JOIN group_members gm on g.id = gm.group_id  WHERE (gm.user_id = 1; AND gm.accepted = 1)", userId)
	// rows, err := db.Query("SELECT * FROM groups")
	rows, err := db.Query("SELECT * FROM groups WHERE admin_id = ? ", userId)
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
	//fmt.Println("groups ==>I", AllGroups)
	utils.WriteJSON(w, 200, AllGroups)
}

func GetAllGroups(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	//fmt.Println("Get groups")
	// rows, err := db.Query("SELECT g.id, g.name, g.description FROM groups g JOIN group_members gm on g.id = gm.group_id  WHERE (gm.user_id = 1; AND gm.accepted = 1)", userId)
	// rows, err := db.Query("SELECT * FROM groups")
	rows, err := db.Query("SELECT * FROM groups WHERE admin_id != ? ", userId)
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
	//fmt.Println("groups ==>I", AllGroups)
	utils.WriteJSON(w, 200, AllGroups)
}
