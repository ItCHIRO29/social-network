'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './notifications.module.css';

export default function NotificationItem({ notification, setNotifications }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async (action, notification) => {
        setIsProcessing(true);
        try {
            if (notification.notification_type === 'follow_request') {
                let response;
                if (action === 'accept') {
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/follow?reference_id=${notification.reference_id}`, {
                        method: 'PUT',
                        credentials: 'include',
                    });
                } else if (action === 'reject') {
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/follow?reference_id=${notification.reference_id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });
                }
                if (response.ok) {
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                }
            }
        } catch (error) {
            console.error('Error handling notification action:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getNotificationDescription = () => {
        switch (notification.notification_type) {
            case 'follow':
                return 'started following you';
            case 'follow_request':
                return 'wants to follow you';
            case 'accepted_follow':
                return 'accepted your follow request';
            case 'rejected_follow':
                return 'rejected your follow request';
            case 'group_invitation':
                return 'invited you to join their group';
            case 'request_join_group':
                return 'requested to join your group';
            case 'event':
                return 'created a new event';
            default:
                return '';
        }
    };

    const profileImage = notification.image 
        ? `${process.env.NEXT_PUBLIC_API_URL}/${notification.image}` 
        : '/images/profile.png';

    const renderActionButtons = () => {
        if (notification.notification_type === 'follow' || 
            notification.notification_type === 'accepted_follow' || 
            notification.notification_type === 'rejected_follow') {
            return null;
        }

        if (notification.notification_type === 'follow_request' || 
            notification.notification_type === 'group_invitation' || 
            notification.notification_type === 'request_join_group') {
            return (
                <div className={styles.actions}>
                    <button 
                        className={styles.acceptButton}
                        onClick={() => handleAction('accept', notification)}
                        disabled={isProcessing}
                    >
                        Accept
                    </button>
                    <button 
                        className={styles.rejectButton}
                        onClick={() => handleAction('reject', notification)}
                        disabled={isProcessing}
                    >
                        Reject
                    </button>
                </div>
            );
        }

        if (notification.notification_type === 'event') {
            return (
                <div className={styles.actions}>
                    <button 
                        className={styles.acceptButton}
                        onClick={() => handleAction('view', notification)}
                        disabled={isProcessing}
                    >
                        View Event
                    </button>
                </div>
            );
        }

        return null;
    };

    return (
        <div className={styles.notification}>
            <div className={styles.notificationContent}>
                <Link href={`/profile/${notification.sender}`}>
                    <img 
                        src={profileImage} 
                        alt="Profile" 
                        className={styles.profileImage}
                        width={40}
                        height={40}
                    />
                </Link>
                <div className={styles.notificationText}>
                    <span className={styles.username}>{notification.sender}</span>
                    <span>{getNotificationDescription()}</span>
                </div>
            </div>
            {renderActionButtons()}
        </div>
    );
} 