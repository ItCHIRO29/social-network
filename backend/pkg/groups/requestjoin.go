package groups

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"social-network/pkg/utils"
)

func Requestjoin(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	groupId, err := strconv.Atoi(r.URL.Query().Get("groupId"))
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, "invalide group ID")
		return
	}
	query := `INSERT INTO group_members (user_id , group_id , accepted) values (? , ? , 0) `

	res, err1 := db.Exec(query, userId, groupId)
	if err1 != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, err1)
		return
	}
	adminId, err := GetAdminGrp(db, groupId)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, err1)
		return
	}
	reference, err1 := res.LastInsertId()
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, err1)
		return
	}
	query = `INSERT INTO notifications (receiver_id, sender_id, type, reference_id, content, seen, created_at) VALUES (? ,? ,? ,? ,? ,? ,?)`
	_, err1 = db.Exec(query, adminId, userId, "request_join_group", reference, "", 0, time.Now())
	if err1 != nil {
		fmt.Println(err1)
		utils.WriteJSON(w, http.StatusInternalServerError, err1)
		return
	}
	utils.WriteJSON(w, http.StatusAccepted, nil)
}

func GetAdminGrp(db *sql.DB, groupId int) (int, error) {
	adminId := 0
	query := `SELECT admin_id FROM groups WHERE id=?`
	err := db.QueryRow(query, groupId).Scan(&adminId)
	if err != nil {
		return 0, err
	}
	return adminId, nil
}

func LeaveGrp(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	groupId := r.URL.Query().Get("groupId")
	query := `DELETE FROM group_members where (group_id = ? AND user_id= ?)`
	_, err := db.Exec(query, groupId, userId)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, nil)
		fmt.Println(err)
		return
	}
	utils.WriteJSON(w, http.StatusAccepted, nil)
}
