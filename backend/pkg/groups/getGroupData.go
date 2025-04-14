package groups

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GroupMembers(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	groupId := r.URL.Query().Get("groupId")
	query := `
		SELECT 
			u.id, 
			u.first_name, 
			u.last_name, 
			u.username, 
			u.image
		FROM 
			users u
		INNER JOIN 
			group_members gm 
		ON 
			gm.user_id = u.id
		WHERE 
			gm.group_id = ?`
	result, err := db.Query(query, groupId)
	if err != nil && err != sql.ErrNoRows {
		fmt.Println("Error geting members", err)
		utils.WriteJSON(w, http.StatusInternalServerError, []models.User{})
		return
	}
	users := []models.User{}
	for result.Next() {
		user := models.User{}
		if err := result.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Image); err != nil {
			fmt.Println("Error geting members", err)
			utils.WriteJSON(w, http.StatusInternalServerError, []models.User{})
			return
		}
		users = append(users, user)
	}
	fmt.Println("users", users)
	utils.WriteJSON(w, http.StatusAccepted, users)
}
