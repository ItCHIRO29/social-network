package followers

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetFollowers(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	query := `SELECT follower_id FROM followers WHERE following_id = $1`
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
	fmt.Println("Followers ==>", Followers)
	utils.WriteJSON(w, http.StatusOK, Followers)
}
