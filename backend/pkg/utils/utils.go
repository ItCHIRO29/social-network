package utils

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

var MaxUploadSize int64 = 10_485_760

const Limit = 10

func WriteJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func ValidateAndSaveImage(r *http.Request, imageType string, filename string) (string, error) {
	err := r.ParseMultipartForm(MaxUploadSize)
	if err != nil {
		fmt.Println("in parse multipart form", err)
		return "", err
	}

	_, ok := r.MultipartForm.File["image"]
	if ok {
		file, _, err := r.FormFile("image")
		if err != nil {
			fmt.Println("in form file", err)
			return "", err
		}
		defer file.Close()

		firstBytes := make([]byte, 512)
		_, err = file.Read(firstBytes)
		if err != nil {
			fmt.Println("in read", err)
			return "", err
		}
		file.Seek(0, 0)

		contentType := http.DetectContentType(firstBytes)
		extension := ""
		if contentType == "image/jpeg" {
			extension = ".jpg"
		} else if contentType == "image/png" {
			extension = ".png"
		} else if contentType == "image/gif" {
			extension = ".gif"
		} else {
			return "", errors.New("invalid image type should be jpeg, png or gif")
		}

		var path string
		switch imageType {
		case "profile":
			path = "uploads/profileImages/" + filename + extension
		case "post":
			path = "uploads/postsImages/" + filename + extension
		case "comment":
			path = "uploads/commentsImages/" + filename + extension
		}

		err = os.MkdirAll(filepath.Dir(path), 0o755)
		if err != nil {
			fmt.Println("Error creating directory:", err)
			return "", err
		}

		dest, err := os.Create(path)
		if err != nil {
			fmt.Println("in create", err)
			return "", err
		}
		defer dest.Close()
		_, err = io.Copy(dest, file)
		if err != nil {
			fmt.Println("in copy", err)
			return "", err
		}
		return path, nil
	}
	return "", nil
}

// CORS Middleware
func EnableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization") // Added Authorization here
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight (OPTIONS) requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func GetUserIdFromUsername(db *sql.DB, username string) (int, error) {
	var userId int
	err := db.QueryRow("SELECT id FROM users WHERE username=?", username).Scan(&userId)
	if err != nil {
		return 0, err
	}
	return userId, nil
}

func GetUsernameFromId(db *sql.DB, userId int) (string, error) {
	var username string
	err := db.QueryRow("SELECT username FROM users WHERE id=?", userId).Scan(&username)
	if err != nil {
		return "", err
	}
	return username, nil
}

func GetFullNameFromId(db *sql.DB, userId int) (string, error) {
	var fullName string
	var firstName, lastName string
	err := db.QueryRow("SELECT first_name,last_name FROM users WHERE id=?", userId).Scan(&firstName, &lastName)
	if err != nil {
		return "", err
	}
	fullName = firstName + " " + lastName
	return fullName, nil
}

func IsPublicProfile(db *sql.DB, userId int) (bool, error) {
	var isPublic bool
	err := db.QueryRow("SELECT public FROM users WHERE id=?", userId).Scan(&isPublic)
	if err != nil {
		return false, err
	}
	return isPublic, nil
}

func GetUserName(db *sql.DB, userId int) string {
	var username string
	err := db.QueryRow("SELECT username FROM users WHERE id=?", userId).Scan(&username)
	if err != nil {
		return ""
	}
	return username
}

func InsertNotification(db *sql.DB, userId int, notificationType string) {
	_, err := db.Exec("INSERT INTO notifications (receiver_id,sender_id, type,reference_id,content,seen,created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", userId, 1, notificationType, 0, "", 0, time.Now().Format("2006-01-02 15:04:05.999999999Z07:00"))
	if err != nil {
		fmt.Println("Error inserting notification:", err)
	}
}

func CheckUserInGrp(user_id int, groupId int, db *sql.DB) bool {
	query := `SELECT * FROM group_members where (user_id = ? AND group_id = ? AND accepted = 1)`
	_, err := db.Query(query, user_id, groupId)
	if err != nil {
		if err == sql.ErrNoRows {
			return false
		}
		fmt.Println("Error checking user in db", err)
		return false
	}
	return true
}

func GetGroupMembers(group_id int, db *sql.DB) []int {
	query := `SELECT user_id FROM group_members WHERE group_id = ? AND accepted=1`
	rows, err := db.Query(query, group_id)
	if err != nil {
		fmt.Fprintln(os.Stderr, "query error:", err)
		return []int{}
	}
	defer rows.Close()
	var result []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			fmt.Println("query error:", err)
			return []int{}
		}
		result = append(result, id)
	}
	return result
}

func Include(arr []int, id int) bool {
	for _, Id := range arr {
		if id == Id {
			return true
		}
	}
	return false
}

// chack if the user if a follower of the user
func CheckFollowing(db *sql.DB, userId int, user_id_str string) bool {
	fmt.Println("userId", userId)

	// var user_id int
	// err := db.QueryRow("SELECT id FROM users WHERE username = ?", user_id_str).Scan(&user_id)
	// if err != nil {
	// 	fmt.Println("error in checkfollowing:", err)
	// 	return false
	// }
	var isfollowing bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ? AND accepted = 1)", userId, user_id_str).Scan(&isfollowing)
	fmt.Println("following_id", isfollowing)
	fmt.Println("user_id", user_id_str)
	if err != nil {
		fmt.Println("error in checkfollowing:", err)
		return false
	}
	return isfollowing
}
