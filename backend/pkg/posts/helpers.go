package posts

import (
	"database/sql"
	"errors"
	"social-network/pkg/models"
	"time"
)

func GetId(from string, Db *sql.DB) (string, int, error) {
	From := 0
	name := ""
	_ = Db.QueryRow("SELECT id,Nickname FROM user WHERE uid = ?", from).Scan(&From, &name)
	if From == 0 {
		return name, From, errors.New("not exist")
	}
	return name, From, nil
}

func CheckExpiredCookie(cookie string, now time.Time, Db *sql.DB) bool {
	var expired time.Time
	Db.QueryRow("SELECT expired_at FROM user WHERE uid = ?", cookie).Scan(&expired)

	return now.Compare(expired) <= -1
}

func CheckIfLikedPost(post_id, user_id int, db *sql.DB) (bool, bool) {
	isLiked := 0
	db.QueryRow("SELECT is_liked FROM postReact WHERE post_id = ? AND user_id = ?", post_id, user_id).Scan(&isLiked)
	switch isLiked {
	case 2:
		return false, true
	case 1:
		return true, false
	default:
		return false, false
	}
}

func parseDate(dateStr string) string {
	// Parse the time string
	parsedTime, err := time.Parse(time.RFC3339, dateStr)
	if err != nil {
		return ""
	}

	// Format as dd/mm/yy
	return parsedTime.Format("02/01/06")
}

func Tablelen(table string, total *int, db *sql.DB) error {
	err := db.QueryRow("SELECT COUNT(*) FROM " + table).Scan(total)
	return err
}

func ExtractPosts(start int, db *sql.DB) (*sql.Rows, error) {
	rows, err := db.Query(`SELECT post_id, post_title, post_content, post_date, post_author, post_likes, post_dislikes, post_comments_count
	FROM single_post
   ORDER BY post_date DESC LIMIT ? OFFSET ?`, models.PostsPerPage, start)
	if err != nil {
		return nil, err
	}
	return rows, err
}
