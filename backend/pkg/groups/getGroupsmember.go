package groups

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetGroupsMember(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		return
	}
	rows, err := db.Query(`
    SELECT g.*  
    FROM groups g
    LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.accepted = 1
    WHERE gm.user_id = ? LIMIT ? OFFSET ?`, userId, utils.Limit, utils.Limit*page)
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
	fmt.Println(AllGroups)
	utils.WriteJSON(w, 200, AllGroups)
}
