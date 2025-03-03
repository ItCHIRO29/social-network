package users

import (
	"database/sql"

	"social-network/pkg/models"
)

func GetUserDataHelper(db *sql.DB, userId int) (models.User, error) {
	var profile models.User
	err := db.QueryRow("SELECT id, first_name, last_name, gender ,age, bio, username, image, email FROM users WHERE id=?", userId).Scan(&profile.FirstName, &profile.LastName, &profile.Gender, &profile.Age, &profile.Bio, &profile.Username, &profile.Image, &profile.Email)
	if err != nil {
		return models.User{}, err
	}
	return profile, nil
}
