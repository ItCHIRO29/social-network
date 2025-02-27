package models

type User struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Nickname  string `json:"nickname"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	Bio       string `json:"bio"`
	Image     string `json:"image"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}
