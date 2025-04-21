package followers

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetFollowing(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "username is required", http.StatusBadRequest)
		return
	}
	uId, err := utils.GetUserIdFromUsername(db, username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	Followings := make([]models.Following, 0)

	query := `SELECT f.following_id, u.image
FROM followers f
JOIN users u ON f.following_id = u.id
WHERE f.follower_id = $1 
  AND f.accepted = 1
  AND (
    EXISTS (
      SELECT 1 
      FROM followers 
      WHERE follower_id = $2 
        AND following_id = $1 
        AND accepted = 1
    ) 
    OR $1 = $2
  );
`

	rows, err := db.Query(query, uId, userId)
	if err != nil {
		fmt.Println("Error getting following:", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var following models.Following
		err := rows.Scan(&following.ID, &following.Image)
		following.Username, err = utils.GetUsernameFromId(db, following.ID)
		if err != nil {
			fmt.Println("Error getting username:", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
		Followings = append(Followings, following)
	}
	fmt.Println("Followings:", Followings)
	utils.WriteJSON(w, http.StatusOK, Followings)
}
