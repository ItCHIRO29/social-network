'use client';

import { useState, useEffect } from 'react';
import styles from './people.module.css';
import FollowButton from '@/components/common/FollowButton';

export default function People() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/GetAllUsers`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('Raw API response:', data);
                    // Use users array which contains the follow button states
                    setUsers(data.users || []);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    const handleFollowStateChange = async (username) => {
        // Refresh the users list after follow state change
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/GetAllUsers`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Error refreshing users:', error);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading users...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>People</h1>
            <div className={styles.usersGrid}>
                {users.map((user) => (
                    <div key={user.id} className={styles.userCard}>
                        <img 
                            src={user.image ? `${process.env.NEXT_PUBLIC_API_URL}/${user.image}` : '/images/profile.png'} 
                            alt={`${user.first_name} ${user.last_name}`} 
                            className={styles.userImage}
                        />
                        <h3>{user.first_name} {user.last_name}</h3>
                        <FollowButton 
                            userData={user}
                            onStateChange={() => handleFollowStateChange(user.username)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}