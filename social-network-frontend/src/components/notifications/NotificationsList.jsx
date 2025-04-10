'use client';

import { useState, useEffect } from 'react';
import NotificationItem from './NotificationItem';
import styles from './notifications.module.css';

export default function NotificationsList({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        if (notifications.length === 0) {
            fetchNotifications();
        }

        // Listen for new notifications from websocket
        document.addEventListener('notification', (event) => {
            console.log("notification event", event.detail);
            setNotifications(prev => {
                const isDuplicate = prev.some(n => n.referenceId === event.detail.referenceId);
                if (!isDuplicate) {
                    setNotificationCount(prevCount => prevCount + 1);
                    return [...prev, event.detail];
                }
                return prev;
            });
        });

        return () => {
            document.removeEventListener('notification', () => {});
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/getNotifications`, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }
            const data = await response.json();
            setNotifications(data);
            setNotificationCount(data.length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.notificationsHeader}>
                <h3>Notifications</h3>
                <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
            <div className={styles.notificationsList}>
                {loading ? (
                    <div className={styles.loading}>Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className={styles.noNotifications}>No notifications</div>
                ) : (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={`${notification.referenceId}-${notification.type}`}
                            notification={notification}
                            setNotifications={setNotifications}
                        />
                    ))
                )}
            </div>
        </div>
    );
} 