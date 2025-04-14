package followers

import (
	"database/sql"
	"net/http"
	"strconv"

	"social-network/pkg/models"
	"social-network/pkg/utils"
)

func GetFollowers(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
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

	Followers := make([]models.Followers, 0)

	query := `SELECT f.follower_id, u.image
FROM followers f
JOIN users u ON f.follower_id = u.id
WHERE f.following_id = $1 
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
	LIMIT ? OFFSET ?
`

	rows, err := db.Query(query, uId, userId, utils.Limit, utils.Limit*page)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var follower models.Followers
		err := rows.Scan(&follower.ID, &follower.Image)
		if err != nil {
			continue
		}
		follower.Username, err = utils.GetUsernameFromId(db, follower.ID)
		if err != nil {
			http.Error(w, "internal server error", http.StatusInternalServerError)
			return
		}
		Followers = append(Followers, follower)
	}
	utils.WriteJSON(w, http.StatusOK, Followers)
}
