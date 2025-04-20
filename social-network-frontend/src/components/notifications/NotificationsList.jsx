import { useState, useEffect, use } from 'react';
import NotificationItem from './NotificationItem';
import styles from './notifications.module.css';

export default function NotificationsList() {
    const [notifications, setNotifications] = useState([]);
    const [showList, setShowList] = useState(false);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const iconSize = 25;


    const updateNotificationsCount = () => {
        let newCount = 0;
        if (notifications.length > 0) {
            for (let i = 0; i < notifications.length; i++) {
                if (notifications[i].seen !== true) {
                    newCount++
                } else {
                    break;
                }
            }
        }
        setNotificationsCount(newCount);
    }

    useEffect(() => {
        updateNotificationsCount();
    }, [notifications]);

    const markAsSeen = async () => {
        try {
            if (notifications.length > 0 && notifications[0].seen === false) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/seen`, {
                    credentials: 'include',
                    method: 'PUT'
                });
                if (response.ok) {
                    notifications[0].seen = true;
                    setNotifications(notifications);
                    updateNotificationsCount();
                }
            }
        } catch (error) {
            console.error('Error marking as seen:', error);
        }
    }
    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/getNotifications`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {

        fetchNotifications();

        document.addEventListener('notification', (event) => {
            fetchNotifications();
        });
    }, []);

    const toggleNotifications = () => {
        setShowList(!showList);
        markAsSeen();
        if (!showList) {
            fetchNotifications();
        }
    }

    return (
        <div className={styles.notificationWrapper}>
            <button
                onClick={toggleNotifications}
                className={styles.notificationButton}
            >
                <img
                    src="/icons/notifications.svg"
                    alt="notifications"
                    width={iconSize}
                    height={iconSize}
                />
                {notificationsCount > 0 && notifications[0] && notifications[0].seen === false && (
                    <span className={styles.notificationBadge}>
                        {notificationsCount > 99 ? '99+' : notificationsCount}
                    </span>
                )}
            </button>

            {showList && (
                <div className={styles.notificationsContainer}>
                    <div className={styles.notificationsHeader}>
                        <h3>Notifications</h3>
                        <div className={styles.closeButton} onClick={() => setShowList(false)} role="button" tabIndex={0}>×</div>
                    </div>
                    <div className={styles.notificationsList}>
                        {isLoading ? (
                            <div className={styles.loading}>Loading notifications...</div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <NotificationItem
                                    key={`${notification.id}-${notification.type}`}
                                    notification={notification}
                                    setNotifications={setNotifications}
                                    notifs={notifications}
                                />
                            ))
                        ) : (
                            <div className={styles.noNotifications}>No notifications</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}