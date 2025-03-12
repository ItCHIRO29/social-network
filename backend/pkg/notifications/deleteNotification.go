package notifications

import "database/sql"

func DeleteNotification(tx *sql.Tx, referenceId int, notifType string) error {
	_, err := tx.Exec("DELETE FROM notifications WHERE (reference_id = ? AND type = ?)", referenceId, notifType)
	return err
}
