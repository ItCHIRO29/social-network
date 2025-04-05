package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"social-network/pkg/auth"
	"social-network/pkg/chat"
	comments "social-network/pkg/comment"
	database "social-network/pkg/db/sqlite"
	groups "social-network/pkg/groups"
	"social-network/pkg/notifications"
	"social-network/pkg/posts"
	"social-network/pkg/users"
	"social-network/pkg/utils"
	ws "social-network/pkg/websocket"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db := database.Open()
	// limiters := auth.Limiters{}
	// InsertSemiPrivate(db)
	mainMux := http.NewServeMux()
	authHandler := auth.CreateAuthMux(db)
	mainMux.Handle("/api/auth/", http.StripPrefix("/api/auth", authHandler))
	mainMux.Handle("/api/posts/", http.StripPrefix("/api/posts", posts.CreatePostsMux(db)))
	mainMux.Handle("/api/comment", http.StripPrefix("/api", comments.CreateCommentsMux(db)))
	mainMux.Handle("/api/users/", http.StripPrefix("/api/users", users.CreateUsersMux(db)))
	mainMux.Handle("/api/groups/", http.StripPrefix("/api/groups", groups.CreateGroupsMux(db)))
	mainMux.Handle("/api/chat/", http.StripPrefix("/api/chat", chat.CreateChatMux(db)))
	mainMux.Handle("/api/notifications/", http.StripPrefix("/api/notifications", notifications.CreateNotificationsMux(db)))

	// serve images
	mainMux.Handle("/uploads/", http.StripPrefix("/uploads", http.FileServer(http.Dir("uploads"))))

	mainMux.Handle("/api/ws", http.StripPrefix("/api/ws", auth.Middleware(db, 20, 20, time.Second, ws.Upgrade)))
	go ws.Hub.Run()
	go ws.Hub.PingService(db)
	// Start Server
	fmt.Println("\033[42mServer is running on port 8080\033[0m")
	log.Fatalln(http.ListenAndServe("0.0.0.0:8080", utils.EnableCORS(mainMux)))
}

// func InsertSemiPrivate(db *sql.DB) {
// 	// Insert semi-private post{
// 	userIds := []int{1, 2, 3}
// 	// var userIdsJson []byte
// 	userIdsJson, err1 := json.Marshal(userIds)
// 	if err1 != nil {
// 		fmt.Println("error in InsertSemiPrivate:", err1)
// 		return
// 	}
// 	_, err := db.Exec("INSERT INTO posts (user_id, title, content, created_at, image, privacy,can_see) VALUES (?, ?, ?, ?, ?, ?,?)", 1, "semi-private", "This is a semi-private post", time.Now(), "", "semi-private", string(userIdsJson))
// 	if err != nil {
// 		fmt.Println("error in InsertSemiPrivate:", err)
// 		return
// 	}
// }

// func SelectSemiPrivate(db *sql.DB) {
// 	fmt.Println("Selecting semi-private posts")
// 	query := `SELECT content FROM posts , json_each(can_see)
// 		WHERE json_each.value = ? AND privacy = 'semi-private'`
// 	rows, err := db.Query(query, 1)
// 	if err != nil || err == sql.ErrNoRows {
// 		fmt.Println("error in GetPosts:", err)
// 		return
// 	}
// 	defer rows.Close()
// 	// var id int
// 	for rows.Next() {
// 		var content string
// 		err := rows.Scan(&content)
// 		if err != nil {
// 			fmt.Println("error in GetPosts:", err)
// 			return
// 		}
// 		fmt.Println("Post data :\n", content)
// 	}
// 	fmt.Println("End of semi-private posts")
// }
