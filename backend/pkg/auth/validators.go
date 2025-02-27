package auth

import "golang.org/x/crypto/bcrypt"

func ValidateEmail(email string) bool {
	return true
}

func isValidPassword(hashedPassword string, password string) bool {
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)); err != nil {
		return false
	}
	return true
}

func ValidateUsername(username string) bool {
	return true
}
