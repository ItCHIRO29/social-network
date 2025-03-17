package ws

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"social-network/pkg/utils"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// return r.Host == "localhost:3000"
		return true
	},
}

func Upgrade(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to upgrade connection"})
		fmt.Fprintln(os.Stderr, err)
		return
	}
	fmt.Println("new connection .................................................")
	username, err := getUsername(db, userId)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		fmt.Fprintln(os.Stderr, "invalid username!")
		return
	}
	Hub.Register <- Client{Conns: []*websocket.Conn{conn}, Username: username, UserId: userId}
	go handleConn(conn, db, userId, username)
}
