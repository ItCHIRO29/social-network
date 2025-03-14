package utils

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

var MaxUploadSize int64 = 10_485_760

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
		if imageType == "profile" {
			path = "./uploads/profileImages/" + filename + extension
		} else if imageType == "post" {
			path = "./uploads/postsImages/" + filename + extension
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
	return "", errors.New("no image")
}

// CORS Middleware
func EnableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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
