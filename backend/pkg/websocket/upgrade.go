package ws

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func Upgrade(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(os.Stderr, err)
		return
	}

	go handleConn(conn)
}

func handleConn(conn *websocket.Conn) {
	for {
		// conn.WriteMessage(websocket.TextMessage, []byte("hello"))
		time.Sleep(time.Second * 2)
		conn.WriteMessage(websocket.TextMessage, []byte("hello"))
	}
}
