'use client';

import { useState } from 'react';
import useDebounce from '../../app/hooks/useDebounce';
import styles from './FollowButton.module.css';

export default function FollowButton({ userData }) {
    const followButton = userData.follow_button;
    const debounce = useDebounce()
    if (!followButton || followButton.state === 'none') {
        return null;
    }

    const [followState, setFollowState] = useState(followButton.state);
    const [referenceId, setReferenceId] = useState(followButton.reference_id);   

    const handleFollow = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/follow?username=${userData.username}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setReferenceId(data.reference_id);
            setFollowState(data.state);
        } catch (error) {
            console.error("Follow Error:", error);
        }
    };

    const handleUnfollow = async (reference_id) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/follow?reference_id=${reference_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            setFollowState("follow");
        } catch (error) {
            console.error("Unfollow Error:", error);
        }
    };

    const handleClick = async () => {
        if (followState === "follow") {
            await handleFollow();
        } else if (followState === "pending" || followState === "unfollow") {
            await handleUnfollow(referenceId);
        }
    };

    return (
        <button className={styles.followButton} onClick={()=>{debounce(handleClick, 500)}}>
            {followState === "follow" && "Follow"}
            {followState === "unfollow" && "Unfollow"}
            {followState === "pending" && "Cancel Request"}
        </button>
    );
} 