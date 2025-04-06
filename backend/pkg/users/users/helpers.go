package users

import (
	"database/sql"

	"social-network/pkg/models"
)

func GetUserData(db *sql.DB, viewerID, profileID int) (models.PublicProfile, error) {
	var user models.PublicProfile

	if viewerID == profileID {
		// If viewing own profile, get all data directly
		err := db.QueryRow(`
			SELECT 
				id,
				username,
				first_name, 
				last_name,
				nickname,
				age,
				gender,
				bio,
				image,
				email,
				public,
				(SELECT COUNT(id) FROM followers WHERE following_id = users.id AND accepted = 1) AS following_cont,
				(SELECT COUNT(id) FROM followers WHERE follower_id = users.id AND accepted = 1) AS followers_cont
			FROM users 
			WHERE id = ?
			LIMIT 1`,
			profileID,
		).Scan(
			&user.ID,
			&user.Username,
			&user.FirstName,
			&user.LastName,
			&user.Nickname,
			&user.Age,
			&user.Gender,
			&user.Bio,
			&user.Image,
			&user.Email,
			&user.Public,
			&user.Followings_count,
			&user.Followers_count,
		)
		if err != nil {
			return user, err
		}
		user.FollowButton.State = "none"
		return user, nil
	}

	query := `
	WITH profile_data AS (
		SELECT 
			u.id,
			u.username,
			u.first_name,
			u.last_name,
			-- Compute visibility
			CASE 
				WHEN u.public = TRUE OR 
					 (f.follower_id = ? AND f.following_id = u.id AND f.accepted = 1) 
				THEN TRUE
				ELSE FALSE 
			END AS can_view_private_data,
			u.nickname,
			u.age,
			u.gender,
			u.bio,
			u.image,
			u.email,
			(SELECT COUNT(id) FROM followers WHERE following_id = u.id AND accepted = 1) AS following_cont,
			(SELECT COUNT(id) FROM followers WHERE follower_id = u.id AND accepted = 1) AS followers_cont,
			COALESCE(f.id, 0) AS reference_id,
			CASE
				WHEN u.id = ? THEN 'none'
				WHEN f.id IS NOT NULL AND f.accepted = 1 THEN 'unfollow'
				WHEN f.id IS NOT NULL AND f.accepted = 0 THEN 'pending'
				ELSE 'follow'
			END AS follow_state
		FROM users u
		LEFT JOIN followers f ON f.follower_id = ? AND f.following_id = u.id
		WHERE u.id = ?
		LIMIT 1
	)
	SELECT 
		id,
		username,
		first_name,
		last_name,
		CASE WHEN can_view_private_data THEN nickname ELSE '' END AS nickname,
		CASE WHEN can_view_private_data THEN age ELSE 0 END AS age,
		CASE WHEN can_view_private_data THEN gender ELSE '' END AS gender,
		CASE WHEN can_view_private_data THEN bio ELSE '' END AS bio,
		image,
		CASE WHEN can_view_private_data THEN email ELSE '' END AS email,
		can_view_private_data AS public, -- This reflects access, not real 'u.public'
		following_cont,
		followers_cont,
		reference_id,
		follow_state
	FROM profile_data;
	`

	err := db.QueryRow(query, viewerID, viewerID, viewerID, profileID).Scan(
		&user.ID, &user.Username,
		&user.FirstName, &user.LastName, &user.Nickname, &user.Age, &user.Gender, &user.Bio,
		&user.Image, &user.Email, &user.Public,
		&user.Followings_count, &user.Followers_count,
		&user.FollowButton.ReferenceID, &user.FollowButton.State,
	)

	if err != nil {
		return models.PublicProfile{}, err
	}

	return user, nil
}
