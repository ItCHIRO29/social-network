package groups

import (
	"database/sql"
	"fmt"
	"net/http"
	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func getGroupData(r *http.Request, w http.ResponseWriter, db *sql.DB, userID int) {
	groupId, middlewareErr := groupsMiddleware(r, db, userID, false)
	if middlewareErr != nil {
		utils.WriteJSON(w, middlewareErr.Code, middlewareErr.Err)
		return
	}

	getGroupQuery := `SELECT * FROM groups WHERE id = $1`
	group := models.Group{}
	err := db.QueryRow(getGroupQuery, groupId).Scan(&group.Id, &group.AdminId, &group.Name, &group.Description)
	if err != nil {
		fmt.Println(err)
		if err == sql.ErrNoRows {
			utils.WriteJSON(w, 404, "group not found")
			return
		}

		utils.WriteJSON(w, 500, "internal server error")
		return
	}
	utils.WriteJSON(w, 200, group)

}
