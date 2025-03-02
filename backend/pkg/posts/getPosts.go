package posts

import (
	"database/sql"
	"net/http"
)

func GetPosts(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
}
