'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './notifications.module.css';
import { useRouter } from 'next/navigation';
import { dateFormat } from '@/utils/dateFormat';

export default function NotificationItem({ notification, setNotifications, notifs }) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [loading, setLoading] = useState(false);

    const MarkSeenNotif = async (notif) => {
        try {
            let resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/Delete?id=${notif.id}`, {
                method: "DELETE",
                credentials: 'include',
            })
            if (!resp.ok) {
                console.error("Error in Deleting notif")
            }
        } catch {
            console.error("Error in Deleting notif")

        }
    }

    const handleAction = async (action, notification) => {
        setIsProcessing(true);
        try {
            let response;
            if (notification.notification_type === 'follow_request') {
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

            } else if (notification.notification_type === 'request_join_group' || notification.notification_type === 'group_invitation') {
                if (action === 'accept') {
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/invitation`, {
                        body: JSON.stringify({
                            reference_id: notification.reference_id,
                            type: notification.notification_type,
                        }),
                        method: 'PUT',
                        credentials: 'include',
                    });
                } else if (action === 'reject') {
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/invitation`, {
                        method: 'DELETE',
                        credentials: 'include',
                        body: JSON.stringify({
                            group_id: notification.additional_data.group_id,
                            type: notification.notification_type,
                            sender: notification.sender,
                        }),
                    });

                }
            } else if (notification.notification_type === 'event') {
                router.push(`/groups/${notification.additional_data.group_name}/events/${notification.reference_id}`);
                setNotifications(notifs.filter((notif, _) => notif.id != notification.id))
                MarkSeenNotif(notification)
            }

            if (response) {
                if (response.ok) {
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                } else if (response.status === 400) {
                    notification.error = "You cannot do any actions, maybe because sender canceled the request"
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
                return `requested to join your group`;
            case 'event':
                return 'created a new event in the group';
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
                notification.error ? null : <div className={styles.actions}>
                    <button
                        className={styles.acceptButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAction('accept', notification);
                        }}
                        disabled={isProcessing}
                    >
                        Accept
                    </button>
                    <button
                        className={styles.rejectButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAction('reject', notification);
                        }}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAction('view', notification);
                        }}
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
        <div
            className={`${styles.notification} ${notification.read ? '' : styles.unread} ${loading ? styles.loading : ''}`}
        >
            <div className={styles.notificationContent}>
                <Link href={`/profile/${notification.sender}`} onClick={(e) => e.stopPropagation()}>
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
                    {(notification.notification_type === 'request_join_group' || notification.notification_type === 'group_invitation' || notification.notification_type === 'event') &&
                        <span
                            className={styles.groupName}
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/groups/${notification.additional_data.group_name}`);
                            }}
                        >
                            {notification.additional_data.group_name}
                        </span>
                    }
                </div>
                <span className={styles.timestamp}>
                    {dateFormat(notification.created_at)}
                </span>
            </div>
            {notification.error && <span className={styles.error}>{notification.error}</span>}
            {renderActionButtons()}
        </div>
    );
} 