'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './page.module.css';
import AboutUser from '@/components/profile/AboutUser';
import Posts from '@/components/posts/Posts';
import { useUserData } from '@/components/common/providers/userDataContext';

export default function ProfilePage() {
    const router = useRouter();
    const params = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userData: currentUser } = useUserData();
    
    const username = params?.username;
    const isOwnProfile = currentUser?.username === username;

    const fetchUserData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile?username=${username}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/login');
                    return;
                }
                if (response.status === 404) {
                    throw new Error('User not found');
                }
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            setUserData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!username) {
            setError('Username is required');
            setLoading(false);
            return;
        }

        fetchUserData();
    }, [username]);

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!userData) {
        return <div className={styles.error}>User not found</div>;
    }

    return (
        <div className={styles.container}>
        <div className={styles.profileContainer}>
            <AboutUser 
                user={userData}
            />
            <Posts 
                userId={userData.id}
                showCreatePost={isOwnProfile}
            />
        </div>
        </div>
    );
} 