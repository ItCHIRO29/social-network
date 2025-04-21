package models

type User struct {
	ID           int          `json:"id"`
	FirstName    string       `json:"first_name"`
	LastName     string       `json:"last_name"`
	Nickname     string       `json:"nickname"`
	Age          string       `json:"age"`
	Gender       string       `json:"gender"`
	Bio          string       `json:"bio"`
	Image        string       `json:"image"`
	Username     string       `json:"username"`
	Email        string       `json:"email"`
	Password     string       `json:"password"`
	FollowButton FollowButton `json:"follow_button"`
}

type PrivateProfile struct {
	ID               int          `json:"id"`
	Username         string       `json:"username"`
	FirstName        string       `json:"first_name"`
	LastName         string       `json:"last_name"`
	Image            string       `json:"image"`
	FollowButton     FollowButton `json:"follow_button"`
	Followers_count  int          `json:"followers_count"`
	Followings_count int          `json:"followings_count"`
	Public           bool         `json:"public"`
}

type PublicProfile struct {
	ID               int          `json:"id"`
	FirstName        string       `json:"first_name"`
	LastName         string       `json:"last_name"`
	Nickname         string       `json:"nickname"`
	Age              string       `json:"age"`
	Gender           string       `json:"gender"`
	Bio              string       `json:"bio"`
	Image            string       `json:"image"`
	Username         string       `json:"username"`
	Email            string       `json:"email"`
	Public           bool         `json:"public"`
	FollowButton     FollowButton `json:"follow_button"`
	Followers_count  int          `json:"followers_count"`
	Followings_count int          `json:"followings_count"`
	Followers        []Followers  `json:"followers"`
	Following        []Following  `json:"following"`
}

type Followers struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Image    string `json:"image"`
}

type Following struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Image    string `json:"image"`
}

type FollowButton struct {
	State       string `json:"state"`
	ReferenceID int64  `json:"reference_id"`
}

type EditProfile struct {
	UserId int    `json:"user_id"`
	Public bool `json:"public"`
}
