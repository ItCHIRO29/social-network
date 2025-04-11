'use client'
import Link from 'next/link';
import styles from './group-navigation.module.css';

export default function GroupNavigation({ groupId, activeTab }) {
    return (
        <div className={styles.navigation}>
            <Link 
                href={`/groups/${groupId}`} 
                className={`${styles.navLink} ${activeTab === 'overview' ? styles.active : ''}`}
            >
                Overview
            </Link>
            <Link 
                href={`/groups/${groupId}/posts`} 
                className={`${styles.navLink} ${activeTab === 'posts' ? styles.active : ''}`}
            >
                Posts
            </Link>
            <Link 
                href={`/groups/${groupId}/events`} 
                className={`${styles.navLink} ${activeTab === 'events' ? styles.active : ''}`}
            >
                Events
            </Link>
        </div>
    );
}