package users

import (
	"database/sql"

	"social-network/pkg/models"
)

func GetUserData(db *sql.DB, myUserId *int, userId *int) (any, error) {
	args := []any{}
	if myUserId != nil && userId != nil {
		args = append(args, *myUserId, *userId)
	} else if myUserId != nil && userId == nil {
		args = append(args, *myUserId, *myUserId)
	}

	var isPublic bool
	err := db.QueryRow("SELECT public FROM users WHERE id=?", args[0]).Scan(&isPublic)
	if err != nil {
		return nil, err
	}

	if isPublic {
		var user models.PublicProfile
		err := db.QueryRow(`SELECT u.id,
									u.username,
									u.first_name, 
									u.last_name, 
									u.nickname, 
									u.age, 
									u.gender, 
									u.bio, 
									u.image,
									u.email, 
									u.public,
									COALESCE(f.id, 0) AS reference_id,
									CASE
										WHEN u.id = $1 THEN 'none'
										WHEN f.id IS NOT NULL AND accepted = 1 THEN 'unfollow'
										WHEN f.id IS NOT NULL AND accepted = 0 THEN 'pending'
										ELSE 'follow'
									END AS follow_state
									FROM users u
									LEFT JOIN followers f ON (f.follower_id =$1 AND f.following_id = u.id)
									WHERE u.id=$2;`, args...).Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Nickname, &user.Age, &user.Gender, &user.Bio, &user.Image, &user.Email, &user.Public, &user.FollowButton.ReferenceId, &user.FollowButton.State)
		if err != nil {
			return nil, err
		}
		return user, nil
	} else {
		var user models.PrivateProfile
		err := db.QueryRow(`SELECT u.id, 
									u.username,
									u.first_name, 
									u.last_name, 
									u.image,
									public,
									COALESCE(f.id, 0) AS reference_id,
									CASE
										WHEN u.id = $1 THEN 'none'
										WHEN f.id IS NOT NULL AND accepted = 1 THEN 'unfollow'
										WHEN f.id IS NOT NULL AND accepted = 0 THEN 'pending'
										ELSE 'follow'
									END AS follow_state
									FROM users u
									LEFT JOIN followers f ON (f.follower_id =$1 AND f.following_id = u.id)
									WHERE u.id=$2;
		`, args...).Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Image, &user.Public, &user.FollowButton.ReferenceId, &user.FollowButton.State)
		if err != nil {
			return nil, err
		}
		return user, nil
	}
}
