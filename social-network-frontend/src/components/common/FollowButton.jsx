'use client';

import { useState, useEffect } from 'react';
import styles from './FollowButton.module.css';

export default function FollowButton({ userData, onStateChange }) {
    const [followState, setFollowState] = useState('follow');
    const [referenceId, setReferenceId] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userData.follow_button) {
            setFollowState(userData.follow_button.state);
            setReferenceId(userData.follow_button.reference_id);
        } else {
            // If no follow_button data, check if we have follow_state directly
            if (userData.follow_state) {
                setFollowState(userData.follow_state);
                setReferenceId(userData.reference_id || 0);
            } else {
                setFollowState('follow');
                setReferenceId(0);
            }
        }
    }, [userData]);

    const handleFollow = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/follow?username=${userData.username}`, {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setFollowState(data.follow_state);
                setReferenceId(data.reference_id);
                if (onStateChange) onStateChange(userData.username);
            }
        } catch (error) {
            console.error('Error following user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnfollow = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/follow?reference_id=${referenceId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                setFollowState('follow');
                setReferenceId(0);
                if (onStateChange) onStateChange(userData.username);
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonText = () => {
        switch (followState) {
            case 'follow':
                return 'Follow';
            case 'unfollow':
                return 'Unfollow';
            case 'pending':
                return 'Cancel Request';
            default:
                return 'Follow';
        }
    };

    const handleClick = () => {
        if (isLoading) return;
        
        if (followState === 'follow') {
            handleFollow();
        } else {
            handleUnfollow();
        }
    };

    return (
        <button
            className={`${styles.followButton} ${styles[followState]}`}
            onClick={handleClick}
            disabled={isLoading}
        >
            {isLoading ? '...' : getButtonText()}
        </button>
    );
} 