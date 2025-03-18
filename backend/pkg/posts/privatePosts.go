package posts

import (
	"database/sql"
	"net/http"
)

func GetPrivatePosts(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	// Get all private posts
}
