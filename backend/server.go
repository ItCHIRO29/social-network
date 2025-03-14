package main

import (
	"fmt"
	"log"
	"net/http"

	"social-network/pkg/auth"
	"social-network/pkg/chat"
	comments "social-network/pkg/comment"
	database "social-network/pkg/db/sqlite"
	groups "social-network/pkg/groups"
	"social-network/pkg/notifications"
	"social-network/pkg/posts"
	"social-network/pkg/users"
	"social-network/pkg/utils"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db := database.Open()
	// limiters := auth.Limiters{}

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
	// Start Server
	fmt.Println("\033[42mServer is running on port 8080\033[0m")
	log.Fatalln(http.ListenAndServe("0.0.0.0:8080", utils.EnableCORS(mainMux)))
}
