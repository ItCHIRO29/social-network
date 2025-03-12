package auth

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"time"
)

type CustomHandler func(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int)

func Middleware(db *sql.DB, rate int, capacity int, limitertime time.Duration, next CustomHandler) http.HandlerFunc {
	limiters := Limiters{}
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		if err != nil {
			fmt.Println("Cookie not found")
			fmt.Fprintln(os.Stderr, err)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		token := cookie.Value
		//fmt.Println("Token:", token)
		var userId int
		var expiresAtStr string
		err = db.QueryRow("SELECT user_id, expires_at FROM sessions WHERE id=?", token).Scan(&userId, &expiresAtStr)
		if err == sql.ErrNoRows {
			cookie := http.Cookie{
				Name:     "token",
				Value:    "",
				MaxAge:   -1,
				HttpOnly: true,
				Path:     "/",
			}
			http.SetCookie(w, &cookie)
			w.WriteHeader(http.StatusUnauthorized)
			return
		} else if err != nil {
			fmt.Fprintln(os.Stderr, err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		expiresAt, err := time.Parse("2006-01-02 15:04:05.999999999Z07:00", expiresAtStr)
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if time.Now().After(expiresAt) {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		ok, limiter := limiters.GetRateLimiter(userId)
		if !ok {
			limiter = limiters.NewRateLimiter(userId, rate, capacity, limitertime)
		}
		if !limiter.Allow() {
			w.WriteHeader(http.StatusTooManyRequests)
			return
		}
		next(w, r, db, userId)
	}
}
