package users

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"social-network/pkg/utils"
	ws "social-network/pkg/websocket"
)

type User struct {
	Image         string `json:"image"`
	Username      string `json:"username"`
	FirstName     string `json:"firstname"`
	LastName      string `json:"lastname"`
	Online        bool   `json:"online"`
	Notify        bool   `json:"notify"`
	LastMessageId int
	LastActive    time.Time `json:"last_active"`
}

func GetUsers(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	query := `SELECT 
    COALESCE(
        (SELECT MAX(m.id) 
         FROM private_messages m 
         WHERE (sender_id = $1 AND receiver_id = u.id) 
            OR (receiver_id = $1 AND sender_id = u.id)
        ), 
        0
    ) AS max_message_id, 
    u.username, 
    u.first_name, 
    u.last_name, 
    u.image,
	u.last_active,
    COALESCE(
        (SELECT m2.seen 
         FROM private_messages m2 
         WHERE sender_id = u.id 
           AND receiver_id = $1 
         ORDER BY m2.id DESC 
         LIMIT 1
        ), 
        true
    ) AS notify
FROM 
    users u
WHERE 
    u.id != $1 
    AND EXISTS (
        SELECT 1 
        FROM followers 
        WHERE (
            (follower_id = u.id AND following_id = $1) 
            OR (follower_id = $1 AND following_id = u.id)
        ) 
        AND accepted = 1
    );`

	rows, err := db.Query(query, userId)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var users []User
	for rows.Next() {
		var user User
		lastActive := ""
		if err := rows.Scan(&user.LastMessageId, &user.Username, &user.FirstName, &user.LastName, &user.Image, &lastActive, &user.Notify); err != nil {
			fmt.Fprintln(os.Stderr, err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		user.LastActive, err = time.Parse("2006-01-02 15:04:05", lastActive)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		ws.Hub.Mu.Lock()
		_, user.Online = ws.Hub.Clients[user.Username]
		ws.Hub.Mu.Unlock()
		user.Notify = !user.Notify
		users = append(users, user)
	}
	if len(users) > 0 {
		sort.Slice(users, func(i, j int) bool {
			if users[i].LastMessageId == 0 && users[j].LastMessageId == 0 {
				return strings.ToLower(users[i].FirstName+users[i].LastName) < strings.ToLower(users[j].FirstName+users[j].LastName)
			}
			return users[i].LastMessageId > users[j].LastMessageId
		})
	}
	utils.WriteJSON(w, http.StatusOK, users)
}
