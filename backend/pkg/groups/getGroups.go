package groups

import (
	"database/sql"
	"net/http"
	"social-network/pkg/utils"
	"social-network/pkg/models"
)

func GetGroups(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	rows, err := db.Query("SELECT g.id, g.name, g.description FROM groups g JOIN group_members gm on g.id = gm.group_id  WHERE gm.user_id = 1; AND gm.accepted = 1", userId)
	if err != nil {
		http.Error(w, "internal server error", 500)
		return
	}
	defer rows.Close()

	var groups []models.Groups
	for rows.Next() {
		var group models.Groups
		err = rows.Scan(&group.Id, &group.Name, &group.Description)
		if err != nil {
			http.Error(w, "internal server error", 500)
			return
		}
		groups = append(groups, group)
	}
	utils.WriteJSON(w, 200, groups)
}
