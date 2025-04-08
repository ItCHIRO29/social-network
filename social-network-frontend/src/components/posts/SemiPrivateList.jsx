import { useState, useEffect } from 'react';
import { useUserData } from "../common/providers/userDataContext";
import styles from './SemiPrivateList.module.css';

export default function SemiPrivateList({ selectedFollowers, onSelectionChange }) {
    const { userData } = useUserData();
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFollowers() {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/followers?username=${userData.username}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setFollowers(data);
                }
            } catch (error) {
                console.error('Error fetching followers:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchFollowers();
    }, []);

    const handleFollowerToggle = (followerId) => {
        const newSelection = selectedFollowers.includes(followerId)
            ? selectedFollowers.filter(id => id !== followerId)
            : [...selectedFollowers, followerId];
        onSelectionChange(newSelection);
    };

    if (loading) {
        return <div className={styles.loading}>Loading followers...</div>;
    }

    return (
        <div className={styles.container} id="choose-followers">
            <h3 className={styles.title}>Select Followers</h3>
            {followers.length > 0 ? (
                <div className={styles.followersList}>
                    {followers.map((follower) => (
                        <label key={follower.id} className={styles.followerItem}>
                            <input
                                type="checkbox"
                                checked={selectedFollowers.includes(follower.id)}
                                onChange={() => handleFollowerToggle(follower.id)}
                                className={styles.checkbox}
                                id={follower.id}
                                value={follower.id}
                                name={follower.username}
                            />
                            <span className={styles.followerName}>{follower.username}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <p className={styles.noFollowers}>No followers available</p>
            )}
        </div>
    );
} 