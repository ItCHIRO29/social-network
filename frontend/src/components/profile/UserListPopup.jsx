'use client';

import Link from 'next/link';
import styles from './UserListPopup.module.css';
import { useEffect, useState } from 'react';

export default function UserListPopup({ isOpen, onClose, title, username, followButtonState }) {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        console.log("followButtonState ===>", followButtonState);
        const fetchUsers = async () => {
            if (!username || !isOpen) return;

            try {
                const endpoint = title.toLowerCase();
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/users/${endpoint}?username=${username}`,
                    { credentials: 'include' }
                );
                console.log("response ===>", response);
                if (!response.ok) throw new Error('Failed to fetch users');
                setUsers(await response.json());
            } catch (error) {
                console.error('Error fetching users:', error);
                setUsers([]);
            }
        };

        fetchUsers();
        console.log("staaaaaaaaate",followButtonState)
    }, [username, title, isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>{title}</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                <div className={styles.content}>
                    {users.length === 0 ? (
                        
                        <div className={styles.emptyState}>{(followButtonState === 'follow' || followButtonState === 'pending') ? `Follow ${username} to see their ${title.toLowerCase()}` : `No ${title.toLowerCase()} found`}</div>
                    ) : (
                        <ul className={styles.userList}>
                            {users.map(user => (
                                <li key={user.id} className={styles.userItem}>
                                    <Link href={`/profile/${user.username}`} onClick={onClose}>
                                        <img
                                            src={user.image ? `${process.env.NEXT_PUBLIC_API_URL}/${user.image}` : '/images/profile.png'}
                                            alt={user.username}
                                            width={40}
                                            height={40}
                                        />
                                        <div className={styles.userInfo}>
                                            <span className={styles.name}>{user.username}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
} 