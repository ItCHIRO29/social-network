package auth

import (
	"database/sql"

	"social-network/pkg/models"
)

func GetProfileData(db *sql.DB, userId int) (models.User, error) {
	var profile models.User
	err := db.QueryRow("SELECT id, first_name, last_name, gender ,age, bio, username, image, email FROM users WHERE id=?", userId).Scan(&profile.FirstName, &profile.LastName, &profile.Gender, &profile.Age, &profile.Bio, &profile.Username, &profile.Image, &profile.Email)
	if err != nil {
		return models.User{}, err
	}
	return profile, nil
}

func GetUserId(db *sql.DB, cookieValue string) (int, string, error) {
	var id int
	err := db.QueryRow("SELECT id FROM sessions WHERE id=?", cookieValue).Scan(&id)
	if err != nil {
		return 0, "", err
	}
	var username string
	err1 := db.QueryRow("SELECT username FROM users WHERE id=?", id).Scan(&username)
	if err1 != nil {
		return 0, "", err
	}

	return id, username, nil
}
