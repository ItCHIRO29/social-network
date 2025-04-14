package followers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetFollowing(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "username is required", http.StatusBadRequest)
		return
	}
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
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
  )
	LIMIT = ? OFFSET = ?
`

	rows, err := db.Query(query, uId, userId, utils.Limit, utils.Limit*page)
	if err != nil {
		fmt.Println("Error getting following:", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var following models.Following
		err := rows.Scan(&following.ID, &following.Image)
		if err != nil {
			continue
		}
		following.Username, err = utils.GetUsernameFromId(db, following.ID)
		if err != nil {
			fmt.Println("Error getting username:", err)
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
		Followings = append(Followings, following)
	}
	utils.WriteJSON(w, http.StatusOK, Followings)
}
