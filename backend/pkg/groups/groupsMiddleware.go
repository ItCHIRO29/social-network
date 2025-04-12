package groups

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"social-network/pkg/models"
	"strconv"
)

type MiddlewareHttpError struct {
	Err  error
	Code int
}

func groupsMiddleware(r *http.Request, db *sql.DB, userId int, onlyAdmin bool) (int, *MiddlewareHttpError) {
	groupId, err := strconv.Atoi(r.URL.Query().Get("group_id"))
	if err != nil || groupId <= 0 {
		return 0, &MiddlewareHttpError{
			Err:  errors.New("group not found"),
			Code: 404,
		}
	}

	getGroupQuery := `SELECT * FROM groups WHERE id = $1`
	group := models.Group{}
	err = db.QueryRow(getGroupQuery, groupId).Scan(&group.Id, &group.AdminId, &group.Name, &group.Description)
	if err != nil {
		fmt.Println(err)
		if err == sql.ErrNoRows {
			return 0, &MiddlewareHttpError{
				Err:  errors.New("group not found"),
				Code: 404,
			}
		}

		return 0, &MiddlewareHttpError{
			Err:  errors.New("internal server error"),
			Code: 500,
		}
	}

	isAdmin := group.AdminId == userId

	if onlyAdmin && !isAdmin {
		return 0, &MiddlewareHttpError{
			Err:  errors.New("You are not admin To perform this action"),
			Code: 401,
		}
	}

	isMember := false
	getMemberQuery := `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2 AND accepted = 1 LIMIT 1;`
	err = db.QueryRow(getMemberQuery, groupId, userId).Scan(&isMember)
	if err != nil {
		fmt.Println(err)
		if err == sql.ErrNoRows {
			return 0, &MiddlewareHttpError{
				Err:  errors.New("You don't have acces to this group"),
				Code: 403,
			}
		}

		return 0, &MiddlewareHttpError{
			Err:  errors.New("internal server error"),
			Code: 500,
		}
	}

	if !isMember {
		return 0, &MiddlewareHttpError{
			Err:  errors.New("You don't have acces to this group"),
			Code: 403,
		}
	}

	return groupId, nil

}
