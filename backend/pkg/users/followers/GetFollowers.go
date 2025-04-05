package followers

import (
	"database/sql"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetFollowers(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	Followers := make([]models.Followers, 0) // Initialize as empty array instead of nil

	query := `SELECT f.follower_id
FROM followers f 
JOIN users u ON f.follower_id = u.id  
WHERE f.following_id = $1 AND f.accepted = 1`
	rows, err := db.Query(query, userId)
	if err != nil {
		// Return empty array instead of error
		utils.WriteJSON(w, http.StatusOK, Followers)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var Follower models.Followers
		err := rows.Scan(&Follower.ID)
		if err != nil {
			// Return empty array instead of error
			utils.WriteJSON(w, http.StatusOK, Followers)
			return
		}
		Follower.Username, err = utils.GetFullNameFromId(db, Follower.ID)
		if err != nil {
			// Return empty array instead of error
			utils.WriteJSON(w, http.StatusOK, Followers)
			return
		}
		Followers = append(Followers, Follower)
	}
	utils.WriteJSON(w, http.StatusOK, Followers)
}
