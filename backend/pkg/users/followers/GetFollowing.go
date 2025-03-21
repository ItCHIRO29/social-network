package followers

import (
	"database/sql"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetFollowing(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	query := `SELECT following_id FROM followers WHERE follower_id = $1 AND accepted = 1`
	rows, err := db.Query(query, userId)
	if err != nil {
		http.Error(w, "Failed to get followers", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var followings []models.Following
	for rows.Next() {
		var following models.Following
		err := rows.Scan(&following.ID)
		if err != nil {
			http.Error(w, "Failed to scan follower", http.StatusInternalServerError)
			return
		}
		following.Username, err = utils.GetFullNameFromId(db, following.ID)
		if err != nil {
			http.Error(w, "Failed to get follower", http.StatusInternalServerError)
			return
		}
		followings = append(followings, following)
	}
	utils.WriteJSON(w, http.StatusOK, followings)
}
