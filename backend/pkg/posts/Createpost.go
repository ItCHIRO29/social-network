package posts

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"social-network/pkg/models"
	"social-network/pkg/utils"
	"time"
)

func CreatePost(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_token")
		if err != nil || CheckExpiredCookie(cookie.Value, time.Now(), db){
			utils.WriteJSON(w, http.StatusUnauthorized, struct {
				Error string `json:"error"`
			}{Error: "Unauthorized"})
			return
		}
		var post models.Post
		err = json.NewDecoder(r.Body).Decode(&post)
		if err != nil {
			utils.WriteJSON(w, 400, "bad request")
			return
		}
		err = InsertPost(post, cookie.Value, db)
		if err != nil {
			switch err.Error() {
			case "invalid content length":
				utils.WriteJSON(w, http.StatusBadRequest, struct {
					Error string `json:"error"`
				}{Error: err.Error()})
				return
			case "invalid title length":
				utils.WriteJSON(w, http.StatusBadRequest, struct {
					Error string `json:"error"`
				}{Error: err.Error()})
				return
			case "categories doesn't exist":
				utils.WriteJSON(w, http.StatusBadRequest, struct {
					Error string `json:"error"`
				}{Error: err.Error()})
				return
			case "user doesn't exist":
				utils.WriteJSON(w, http.StatusBadRequest, struct {
					Error string `json:"error"`
				}{Error: err.Error()})
				return
			case sql.ErrNoRows.Error():
				utils.WriteJSON(w, http.StatusBadRequest, struct {
					Error string `json:"error"`
				}{Error: err.Error()})
				return
			}
			utils.WriteJSON(w, http.StatusInternalServerError, struct {
				Error string `json:"error"`
			}{Error: err.Error()})
			return
		}
		w.WriteHeader(http.StatusCreated)
	}
}

func InsertPost(post models.Post, sessionToken string, Db *sql.DB) error {
	_, User_id, err := GetId(sessionToken, Db)
	if err != nil {
		return errors.New("user doesn't exist")
	} else if len(post.Content) < 1 {
		return errors.New("invalid content length")
	} else if len(post.Title) < 1 {
		return errors.New("invalid title length")
	} else if post.Type != "public" && post.Type != "private" && post.Type != "semi-private" {
		return errors.New("type doesn't correct")
	}
	return Db.QueryRow("INSERT INTO posts (title,user_id, content, created_at, type ) VALUES (?, ?, ?, ?, ?)", post.Title, post.Content, User_id, time.Now(), post.Type).Err()
}