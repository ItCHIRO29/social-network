package notifications

import (
	"database/sql"
	"fmt"
	"net/http"

	"social-network/pkg/utils"
)

func GetCount(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM notifications WHERE receiver_id = ? AND sender_id != ? AND seen = 0", userId, userId).Scan(&count)
	if err != nil {
		fmt.Println("error in GetCount", err)
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]int{"count": count})
}
