package users

import (
	"database/sql"
	"fmt"

	"social-network/pkg/models"
)

func GetUserData(db *sql.DB, userId int) (any, error) {
	fmt.Println("userId Profile triggered")
	var isPublic bool
	err := db.QueryRow("SELECT public FROM users WHERE id=?", userId).Scan(&isPublic)
	if err != nil {
		return nil, err
	}

	if isPublic {
		var user models.PublicProfile
		err := db.QueryRow("SELECT first_name, last_name, nickname, age, gender, bio, image ,email,public FROM users WHERE id=?", userId).Scan(&user.FirstName, &user.LastName, &user.Nickname, &user.Age, &user.Gender, &user.Bio, &user.Image, &user.Email, &user.Public)
		if err != nil {
			return nil, err
		}
		return user, nil
	} else {
		var user models.PrivateProfile
		err := db.QueryRow("SELECT first_name, last_name, image,public FROM users WHERE id=?", userId).Scan(&user.FirstName, &user.LastName, &user.Image, &user.Public)
		if err != nil {
			return nil, err
		}
		fmt.Println("userProfile:", user)
		return user, nil
	}
}
