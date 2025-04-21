'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationsList from './NotificationsList';
import styles from './Header.module.css';

export default function Header() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        fetchNotificationCount();
        // Set up polling for notification count
        const interval = setInterval(fetchNotificationCount, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNotificationCount = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/count`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setNotificationCount(data.count);
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };

    const handleHomeRoute = () => {
        router.push('/');
    };

    const toggleNotifications = () => {
        console.log('Toggle notifications clicked. Current state:', showNotifications);
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            // Reset notification count when opening notifications
            setNotificationCount(0);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.logo} onClick={handleHomeRoute}>
                <img
                    src="/icons/logo.svg"
                    alt="Social Network"
                    width={40}
                    height={40}
                /> 
            </div>
            <input
                type="search"
                className={styles.searchInput}
                placeholder="Search"
            />
            <div className={styles.rightSection}>
                <div className={styles.notificationWrapper}>
                    <button
                        className={styles.notificationButton}
                        onClick={toggleNotifications}
                        type="button"
                    >
                        <img
                            src="/icons/notifications.svg"
                            alt="Notifications"
                            width={20}
                            height={20}
                            className={styles.notificationIcon}
                        />
                        {notificationCount > 0 && (
                            <span className={styles.notificationBadge}>
                                {notificationCount > 99 ? '99+' : notificationCount}
                            </span>
                        )}
                    </button>
                    {showNotifications && (
                        <NotificationsList
                            isVisible={showNotifications}
                            onClose={() => setShowNotifications(false)}
                            onNotificationsRead={() => setNotificationCount(0)}
                        />
                    )}
                </div>
                <h1>Social Network</h1>
            </div>
        </header>
    );
} 