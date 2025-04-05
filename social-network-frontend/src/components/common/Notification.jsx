'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Notification.module.css';

export default function Notification({ notification, onAction }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async (action) => {
        setIsProcessing(true);
        try {
            await onAction(notification.reference_id, action);
        } catch (error) {
            console.error('Error handling notification action:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderNotificationContent = () => {
        const profileImage = notification.image 
            ? `${process.env.NEXT_PUBLIC_API_URL}/${notification.image}` 
            : '/images/profile.png';

        const userLink = (
            <Link href={`/profile/${notification.sender_username}`} className={styles.userLink}>
                <img 
                    src={profileImage} 
                    alt="Profile" 
                    className={styles.profilePic}
                />
                <span className={styles.userName}>{notification.sender_name}</span>
            </Link>
        );

        switch (notification.type) {
            case 'follow_request':
                return (
                    <div className={styles.notificationItem}>
                        {userLink}
                        <p>wants to follow you</p>
                        <div className={styles.actions}>
                            <button 
                                className={`${styles.actionButton} ${styles.accept}`}
                                onClick={() => handleAction('accept')}
                                disabled={isProcessing}
                            >
                                Accept
                            </button>
                            <button 
                                className={`${styles.actionButton} ${styles.reject}`}
                                onClick={() => handleAction('reject')}
                                disabled={isProcessing}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                );

            case 'follow':
                return (
                    <div className={styles.notificationItem}>
                        {userLink}
                        <p>started following you</p>
                    </div>
                );

            case 'accepted_follow':
                return (
                    <div className={styles.notificationItem}>
                        {userLink}
                        <p>accepted your follow request</p>
                    </div>
                );

            case 'group_invitation':
                return (
                    <div className={styles.notificationItem}>
                        {userLink}
                        <p>{notification.sender_name} invited you to join their group</p>
                        <div className={styles.actions}>
                            <button 
                                className={`${styles.actionButton} ${styles.accept}`}
                                onClick={() => handleAction('accept')}
                                disabled={isProcessing}
                            >
                                Accept
                            </button>
                            <button 
                                className={`${styles.actionButton} ${styles.reject}`}
                                onClick={() => handleAction('reject')}
                                disabled={isProcessing}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                );

            case 'request_join_group':
                return (
                    <div className={styles.notificationItem}>
                        {userLink}
                        <p>{notification.sender_name} requested to join your group</p>
                        <div className={styles.actions}>
                            <button 
                                className={`${styles.actionButton} ${styles.accept}`}
                                onClick={() => handleAction('accept')}
                                disabled={isProcessing}
                            >
                                Accept
                            </button>
                            <button 
                                className={`${styles.actionButton} ${styles.reject}`}
                                onClick={() => handleAction('reject')}
                                disabled={isProcessing}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                );

            case 'event':
                return (
                    <div className={styles.notificationItem}>
                        {userLink}
                        <p>{notification.sender_name} created a new event</p>
                        <div className={styles.actions}>
                            <button 
                                className={`${styles.actionButton} ${styles.accept}`}
                                onClick={() => handleAction('view')}
                                disabled={isProcessing}
                            >
                                View Event
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return renderNotificationContent();
} 