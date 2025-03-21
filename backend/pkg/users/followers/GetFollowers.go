package followers

import (
	"database/sql"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetFollowers(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	query := `SELECT f.follower_id
FROM followers f 
JOIN users u ON f.follower_id = u.id  
WHERE f.following_id = $1 AND f.accepted = 1`
	rows, err := db.Query(query, userId)
	if err != nil {
		http.Error(w, "Failed to get followers", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var Followers []models.Followers
	for rows.Next() {
		var Follower models.Followers
		err := rows.Scan(&Follower.ID)
		if err != nil {
			http.Error(w, "Failed to scan follower", http.StatusInternalServerError)
			return
		}
		Follower.Username, err = utils.GetFullNameFromId(db, Follower.ID)
		if err != nil {
			http.Error(w, "Failed to get follower", http.StatusInternalServerError)
			return
		}
		Followers = append(Followers, Follower)
	}
	utils.WriteJSON(w, http.StatusOK, Followers)
}
