package ws

import (
	"database/sql"
	"fmt"
	"os"
	"sync"
	"time"

	"social-network/pkg/utils"

	"github.com/gorilla/websocket"
	"github.com/mattn/go-sqlite3"
)

type HubType struct {
	Clients    map[string]Client
	Mu         sync.RWMutex
	Register   chan Client
	Unregister chan Client
	Broadcast  chan Message
	Private    chan Message
}

type Client struct {
	Conns    []*websocket.Conn
	UserId   int
	Username string
}

type Message map[string]any

func (message Message) isValidGroupMessage(userid int, db *sql.DB) bool {
	_, ok := message["groupe"].(string)
	groupeid, ok5 := message["groupeId"].(int)
	// _, ok1 := message["sender"].(string)
	_, ok2 := message["message"].(string)
	_, ok3 := message["id"].(float64)
	ok4 := utils.CheckUserInGrp(userid, groupeid, db)
	if !ok || !ok2 || !ok3 || !ok4 || !ok5 {
		fmt.Println("invalid message")
		return false
	}
	return true
}

func (message Message) isValidPrivateMessage() bool {
	receiver, ok1 := message["receiver"].(string)
	_, ok2 := message["message"].(string)
	_, ok3 := message["id"].(float64)
	if !ok1 || !ok2 || !ok3 || receiver == "" {
		fmt.Println("invalid message")
		return false
	}
	return true
}

func (message Message) isValidTypingMessage() bool {
	receiver, ok1 := message["receiver"].(string)
	_, ok2 := message["is_typing"].(bool)
	if !ok1 || !ok2 || receiver == "" {
		return false
	}
	return true
}

func sendChatError(receiver string, conversation string, messageId float64) {
	err := Message{}
	err["type"] = "error"
	err["receiver"] = receiver
	err["conversation"] = conversation
	err["id"] = messageId
	Hub.Private <- err
}

var ChatUsersLimiters sync.Map

/*---------- upgrade connection from http to ws ----------*/

var Hub = HubType{
	Clients:    make(map[string]Client, 1024),
	Register:   make(chan Client, 1024),
	Unregister: make(chan Client, 1024),
	Broadcast:  make(chan Message, 1024),
	Private:    make(chan Message, 1024),
}

func (h *HubType) offlineDelayFunc(client *Client) bool {
	time.Sleep(time.Second * 5)
	h.Mu.Lock()
	defer h.Mu.Unlock()
	if _, ok := h.Clients[client.Username]; ok {
		return false
	}
	return true
}

func (h *HubType) Run() {
	for {
		select {
		case client := <-h.Register:
			broadcast := h.RegisterClient(client)
			if broadcast {
				statusMessage := Message{}
				statusMessage["type"] = "status"
				statusMessage["username"] = client.Username
				statusMessage["online"] = true
				h.BroadcastMessage(statusMessage, &client, nil)
			}

		case client := <-h.Unregister:
			h.UnregisterClient(client)
			statusMessage := Message{}
			statusMessage["type"] = "status"
			statusMessage["username"] = client.Username
			statusMessage["online"] = false
			h.BroadcastMessage(statusMessage, &client, h.offlineDelayFunc)
		case message := <-h.Broadcast:
			h.BroadcastMessage(message, nil, nil)
		case message := <-h.Private:
			h.SendPrivateMessage(message)
		}
	}
}

func (h *HubType) PingService(db *sql.DB) {
	ticker := time.NewTicker(time.Second * 20)
	defer ticker.Stop()

	for range ticker.C {
		h.Mu.Lock()
		for _, client := range h.Clients {
			for _, conn := range client.Conns {
				if err := conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
					fmt.Fprintln(os.Stderr, err)
					Hub.Unregister <- client
					UpdateLastActive(db, client.UserId)

				}
			}
		}
		h.Mu.Unlock()
	}
}

func (h *HubType) RegisterClient(client Client) bool {
	h.Mu.Lock()
	defer h.Mu.Unlock()
	if cl, ok := h.Clients[client.Username]; ok {
		if len(cl.Conns) < 3 {
			cl.Conns = append(cl.Conns, client.Conns...)
		} else {
			cl.Conns = append(cl.Conns[1:], client.Conns...)
		}
		h.Clients[client.Username] = cl
	} else {
		h.Clients[client.Username] = client
		return true
	}
	return false
}

func (h *HubType) UnregisterClient(client Client) {
	h.Mu.Lock()
	defer h.Mu.Unlock()

	if len(client.Conns) == 0 {
		conns := h.Clients[client.Username].Conns
		for _, conn := range conns {
			conn.Close()
		}
		fmt.Println("closing all connections")
		delete(h.Clients, client.Username)
		return
	}

	cl := h.Clients[client.Username]
	var updatedConns []*websocket.Conn
	for _, conn := range cl.Conns {
		if conn != client.Conns[0] {
			updatedConns = append(updatedConns, conn)
			continue
		}
		conn.Close()
	}

	if len(updatedConns) == 0 {
		delete(h.Clients, client.Username)
		return
	}
	cl.Conns = updatedConns
	h.Clients[client.Username] = cl
}

func (h *HubType) SendPrivateMessage(message Message) {
	h.Mu.Lock()
	receiver := message["receiver"].(string)
	to, ok := h.Clients[receiver]
	if !ok {
		h.Mu.Unlock()
		fmt.Fprintln(os.Stderr, "receiver not found")
		return
	}
	for _, conn := range to.Conns {
		if err := conn.WriteJSON(message); err != nil {
			fmt.Fprintln(os.Stderr, err)
		}
	}
	h.Mu.Unlock()
}

func (h *HubType) BroadcastMessage(message any, client *Client, delayFunc func(client *Client) bool) {
	broadcast := func() {
		h.Mu.Lock()
		defer h.Mu.Unlock()
		for _, client := range h.Clients {
			for _, conn := range client.Conns {
				if err := conn.WriteJSON(message); err != nil {
					fmt.Fprintln(os.Stderr, err)
				}
			}
		}
	}

	if delayFunc != nil {
		go func() {
			if delayFunc(client) {
				broadcast()
			}
		}()
	} else {
		broadcast()
	}
}

func getUsername(db *sql.DB, userId int) (string, error) {
	var username string
	query := `SELECT username FROM users WHERE id = ?;`
	err := db.QueryRow(query, &userId).Scan(&username)
	return username, err
}

func handleConn(conn *websocket.Conn, db *sql.DB, userId int, userName string) {
	err := conn.SetReadDeadline(time.Now().Add(time.Second * 30))
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		Hub.Unregister <- Client{Conns: nil, Username: userName}
		UpdateLastActive(db, userId)
		return
	}

	conn.SetPongHandler(func(appData string) error {
		conn.SetReadDeadline(time.Now().Add(time.Second * 30))
		return nil
	})

	for {
		var message Message
		if err := conn.ReadJSON(&message); err != nil {
			Hub.Unregister <- Client{Conns: []*websocket.Conn{conn}, Username: userName}
			UpdateLastActive(db, userId)

			fmt.Fprintln(os.Stderr, err)
			break
		}
		fmt.Println("eeeeeeeeeeeee", message)
		messageType, ok := message["type"].(string)
		if !ok {
			fmt.Fprintln(os.Stderr, "invalid message type")
			continue
		}
		if messageType == "private message" {
			fmt.Println("is message", message)
			ok := message.isValidPrivateMessage()
			if !ok {
				fmt.Fprintln(os.Stderr, "invalid message")
				continue
			}

			if len(message["message"].(string)) == 0 || len(message["message"].(string)) > 500 {
				sendChatError(userName, message["receiver"].(string), message["id"].(float64))
				continue
			}
			message["sender"] = userName
			message["creation_date"] = time.Now().Format("2006-01-02 15:04")
			id, err := saveInDb(db, userId, message)
			if err != nil {
				// fmt.Println("error in saving in db")
				fmt.Fprintln(os.Stderr, err)
				sendChatError(userName, message["receiver"].(string), message["id"].(float64))
				continue
			}
			message["id"] = id
			Hub.Private <- message
		} else if messageType == "typing" {
			ok := message.isValidTypingMessage()
			if !ok {
				continue
			}
			sender, err := getUsername(db, userId)
			if err != nil {
				fmt.Fprintln(os.Stderr, err)
				continue
			}
			message["sender"] = sender
			Hub.Private <- message
		} else if messageType == "ping" {
			message["type"] = "pong"
			message["receiver"] = userName
			Hub.Private <- message
		} else if messageType == "groupe" {
			ok := message.isValidGroupMessage(userId, db)
			if !ok {
				fmt.Fprintln(os.Stderr, "invalid message")
				continue
			}
			if len(message["message"].(string)) == 0 || len(message["message"].(string)) > 500 {
				sendChatError(userName, message["receiver"].(string), message["id"].(float64))
				continue
			}
			message["sender"] = userName
			message["creation_date"] = time.Now().Format("2006-01-02 15:04")
			ismember := utils.CheckUserInGrp(userId, message["groupeId"].(int), db)
			if ismember {
				err := AddMessageToGrp(userId, db, message)
				if err != nil {
					fmt.Fprintln(os.Stderr, "error in insertion", err)
					continue
				}
			} else {
				fmt.Fprintln(os.Stderr, "invalid user")
				return
			}
		}
	}
}

func getUserId(db *sql.DB, username string) (int, error) {
	var id int
	query := `SELECT id FROM users WHERE (username = ?);`
	err := db.QueryRow(query, &username).Scan(&id)
	return id, err
}

func saveInDb(db *sql.DB, senderId int, message Message) (int, error) {
	reciverId, err := getUserId(db, message["receiver"].(string))
	if err != nil {
		fmt.Println("error in getting reciver id")
		fmt.Fprintln(os.Stderr, err)
		return 0, err
	}
	query := `INSERT INTO private_messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?)`
	res, err := db.Exec(query, senderId, reciverId, message["message"].(string), message["creation_date"].(string))
	if err != nil {
		fmt.Println("error in saving in db")

		fmt.Fprintln(os.Stderr, err)
		return 0, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		fmt.Println("error in getting last insert id")
		fmt.Fprintln(os.Stderr, err)
		return 0, err
	}

	return int(id), err
}

func UpdateLastActive(db *sql.DB, userId int) {
	retries := 5
	var err error

	for i := 0; i < retries; i++ {
		fmt.Println("in update last active, user id", userId)
		_, err = db.Exec("UPDATE users SET last_active = ? WHERE id = ?", time.Now().Format("2006-01-02 15:04:05"), userId)
		if err == nil {
			return
		}

		if sqliteError, ok := err.(sqlite3.Error); ok && sqliteError.Code == sqlite3.ErrLocked {
			fmt.Fprintln(os.Stderr, "Database is locked. Retrying...")

			time.Sleep(time.Duration(i+1) * time.Second)
		} else {
			fmt.Fprintln(os.Stderr, err)
			return
		}
	}

	fmt.Fprintln(os.Stderr, "Failed to update after retries:", err)
}

func AddMessageToGrp(senderId int, db *sql.DB, message Message) error {
	query := `INSERT INTO group_chat (? , ? , ? , ?)`
	_, err := db.Exec(query, message["groupeId"].(int), senderId, message["message"].(string), time.Now())
	if err != nil {
		fmt.Fprintln(os.Stderr, "error to insert message", err)
		return err
	}
	return nil
}
