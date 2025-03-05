package groups

import (
	"database/sql"
	"errors"
)

func GetId(from string, Db *sql.DB) (string, int, error) {
	From := 0
	name := ""
	_ = Db.QueryRow("SELECT id,Nickname FROM user WHERE uid = ?", from).Scan(&From, &name)
	if From == 0 {
		return name, From, errors.New("not exist")
	}
	return name, From, nil
}
