package models

type User struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Nickname  string `json:"nickname"`
	Age       string `json:"age"`
	Gender    string `json:"gender"`
	Bio       string `json:"bio"`
	Image     string
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

type PrivateProfile struct {
	Public    bool   `json:"public"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Image     string `json:"image"`
}

type PublicProfile struct {
	FirstName string   `json:"first_name"`
	LastName  string   `json:"last_name"`
	Nickname  string   `json:"nickname"`
	Age       string   `json:"age"`
	Gender    string   `json:"gender"`
	Bio       string   `json:"bio"`
	Image     string   `json:"image"`
	Username  string   `json:"username"`
	Email     string   `json:"email"`
	Followers []string `json:"followers"`
	Following []string `json:"following"`
}
