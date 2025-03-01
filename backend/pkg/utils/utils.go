package utils

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
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
		return "", err
	}

	_, ok := r.MultipartForm.File["image"]
	if ok {
		file, _, err := r.FormFile("image")
		if err != nil {
			return "", err
		}
		defer file.Close()

		firstBytes := make([]byte, 512)
		_, err = file.Read(firstBytes)
		if err != nil {
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
			return "", err
		}
		defer dest.Close()
		_, err = io.Copy(dest, file)
		if err != nil {
			return "", err
		}
		return path, nil
	}
	return "", errors.New("no image")
}

// CORS Middleware
func EnableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight (OPTIONS) requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}
