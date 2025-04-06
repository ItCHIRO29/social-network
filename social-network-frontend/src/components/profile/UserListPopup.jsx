'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './UserListPopup.module.css';

export default function UserListPopup({ isOpen, onClose, users = [], title }) {
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
                        <div className={styles.emptyState}>
                            No {title.toLowerCase()} yet
                        </div>
                    ) : (
                        <ul className={styles.userList}>
                            {users.map(user => (
                                <li key={user.id} className={styles.userItem}>
                                    <Link href={`/profile/${user.username}`} onClick={onClose}>
                                        <Image
                                            src={user.image ? `${process.env.NEXT_PUBLIC_API_URL}/${user.image}` : '/images/profile.png'}
                                            alt={user.full_name}
                                            width={40}
                                            height={40}
                                        />
                                        <div className={styles.userInfo}>
                                            <span className={styles.name}>{user.full_name}</span>
                                            <span className={styles.username}>@{user.username}</span>
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