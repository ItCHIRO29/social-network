package chat

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetChaters(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	// fmt.Println("GetChaters")
	rows, err := db.Query(`SELECT 
							id,
						    CASE 
						        WHEN follower_id = ? THEN following_id 
						        ELSE follower_id 
						    END AS other_user_id
						FROM followers 
						WHERE (follower_id = ? OR following_id = ?) 
						AND accepted = 1
						GROUP BY other_user_id;
						`, userId, userId, userId)
	if err != nil {
		fmt.Println("Error querying database:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var chaters []models.Chaters
	for rows.Next() {
		var chater models.Chaters
		// var accept bool
		err := rows.Scan(&chater.ID, &chater.User2_id)
		if err != nil {
			fmt.Println("Error scanning row:", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		chater.User1_id = userId
		chater.User1_name, err = utils.GetFullNameFromId(db, chater.User1_id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		chater.User2_name, err = utils.GetFullNameFromId(db, chater.User2_id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		chaters = append(chaters, chater)
	}
	// fmt.Println("chaters  ====>", chaters)
	utils.WriteJSON(w, 200, chaters)
}
