package reaction

import (
	"database/sql"
	"net/http"
	"social-network/pkg/auth"
	"time"
)

func CreateGroupsMux(db *sql.DB, limiters *auth.Limiters) http.Handler {
	mux := http.NewServeMux()

	mux.Handle("POST /reaction", auth.Middleware(db, 10, 20, time.Second, CreateReaction))

	return mux
}
