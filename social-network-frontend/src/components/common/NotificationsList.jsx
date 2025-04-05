'use client';

import { useState, useEffect } from 'react';
import Notification from './Notification';
import styles from './NotificationsList.module.css';

export default function NotificationsList({ isVisible, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('NotificationsList mounted, isVisible:', isVisible);
        if (isVisible) {
            fetchNotifications();
        }
    }, [isVisible]);

    const fetchNotifications = async () => {
        console.log('Fetching notifications...');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/getNotifications`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Notifications fetched:', data);
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationAction = async (referenceId, action) => {
        try {
            let endpoint;
            let method;
            let body;

            switch (action) {
                case 'accept':
                    endpoint = '/api/users/follow';
                    method = 'PUT';
                    const formData = new FormData();
                    formData.append('reference_id', referenceId);
                    body = formData;
                    break;
                case 'reject':
                    endpoint = `/api/users/follow?reference_id=${referenceId}`;
                    method = 'DELETE';
                    body = null;
                    break;
                default:
                    return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: method,
                body: body,
                credentials: 'include',
            });

            if (response.ok) {
                // Refresh notifications after action
                fetchNotifications();
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
            }
        } catch (error) {
            console.error('Error handling notification action:', error);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.notificationsHeader}>
                <h3>Notifications</h3>
                <button 
                    className={styles.closeButton}
                    onClick={onClose}
                    type="button"
                >
                    ×
                </button>
            </div>
            <div className={styles.notificationsList}>
                {loading ? (
                    <div className={styles.loading}>Loading notifications...</div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <Notification
                            key={notification.notification_id}
                            notification={notification}
                            onAction={handleNotificationAction}
                        />
                    ))
                ) : (
                    <div className={styles.noNotifications}>No notifications</div>
                )}
            </div>
        </div>
    );
} 