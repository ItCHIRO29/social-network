'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AboutUser.module.css';

export default function AboutUser({ user }) {
    const [isFollowing, setIsFollowing] = useState(user.is_following);
    const [followersCount, setFollowersCount] = useState(user.followers_count);
    const [followingCount, setFollowingCount] = useState(user.following_count);

    const handleFollow = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/follow`, {
                method: isFollowing ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user.id }),
                credentials: 'include',
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
                setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
            }
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
        }
    };

    return (
        <div className={styles.aboutUser}>
            <div className={styles.header}>
                <div className={styles.profileImage}>
                    <Image
                        src={user.image ? `${process.env.NEXT_PUBLIC_API_URL}/${user.image}` : '/images/profile.png'}
                        alt={user.full_name}
                        width={150}
                        height={150}
                        priority
                    />
                </div>
                <div className={styles.userInfo}>
                    <h1>{user.full_name}</h1>
                    <p className={styles.username}>@{user.username}</p>
                    <div className={styles.stats}>
                        <Link href={`/profile/${user.id}/followers`}>
                            <span className={styles.count}>{followersCount}</span> followers
                        </Link>
                        <Link href={`/profile/${user.id}/following`}>
                            <span className={styles.count}>{followingCount}</span> following
                        </Link>
                    </div>
                    {user.id !== parseInt(localStorage.getItem('userId')) && (
                        <button 
                            className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
                            onClick={handleFollow}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>
            {user.bio && (
                <div className={styles.bio}>
                    <h2>About</h2>
                    <p>{user.bio}</p>
                </div>
            )}
        </div>
    );
} 