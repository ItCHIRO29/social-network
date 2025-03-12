package followers

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"social-network/pkg/models"
	"social-network/pkg/notifications"
	"social-network/pkg/utils"
)

func AcceptFollow(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	referenceId, err := strconv.Atoi(r.FormValue("reference_id"))
	if err != nil || referenceId <= 0 {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: fmt.Sprintf("Invalid reference_id, %d", referenceId)})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "internal server Error"})
		return
	}
	res, err := tx.Exec(`UPDATE followers SET accepted = 1 WHERE (id = ? AND following_id = ?)`, referenceId, userId)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		tx.Rollback()
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "internal server Error"})
		return
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		tx.Rollback()
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "internal server Error"})
		return
	}
	if rowsAffected == 0 {
		tx.Rollback()
		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "Invalid request"})
		return
	}

	err = notifications.DeleteNotification(tx, referenceId, "follow_request")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		tx.Rollback()
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "internal server Error"})
		return
	}
	err = tx.Commit()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "internal server Error"})
		return
	}

	w.WriteHeader(http.StatusOK)
}
