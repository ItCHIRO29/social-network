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

func Unfollow(w http.ResponseWriter, r *http.Request, db *sql.DB, userId int) {
	err := r.ParseForm()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: "Invalid request"})
		return
	}
	referenceIdStr := r.FormValue("reference_id")
	fmt.Println("referenceIdStr:", referenceIdStr)
	referenceId, err := strconv.Atoi(referenceIdStr)
	if err != nil || referenceId <= 0 {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusBadRequest, models.HttpError{Error: fmt.Sprintf("Invalid reference_id, %d", referenceId)})
		return
	}
	fmt.Println("referenceId:", referenceId, "userId:", userId)
	tx, err := db.Begin()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		utils.WriteJSON(w, http.StatusInternalServerError, models.HttpError{Error: "internal server Error"})
		return
	}
	res, err := tx.Exec(`DELETE FROM followers WHERE (id = ? AND (follower_id = $2 OR (following_id = $2 AND accepted = false)))`, referenceId, userId)
	if err != nil {
		fmt.Println("error in tx.Exec:", err)
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
		fmt.Println("no rows affected")
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
