'use client';

import { useEffect, useState } from 'react';
import styles from './AboutUser.module.css';
import UserListPopup from './UserListPopup';
import { useUserData } from '@/components/common/providers/userDataContext';
import FollowButton from '@/components/common/FollowButton';

export default function AboutUser({ user }) {
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [privacy, setPrivacy] = useState(user.public);

    const { userData } = useUserData();
    user.isOwnProfile 
    const isOwnProfile = userData?.username === user.username;

    // useEffect(() => {
    //     console.log("user =========>", user);
    // }, []);

    return (
        <div className={styles.aboutUser}>
            <div className={styles.header}>
                <div className={styles.profileImage}>
                    <img
                        width={150}
                        src={user.image ? `${process.env.NEXT_PUBLIC_API_URL}/${user.image}` : '/images/default-avatar.svg'}
                        alt={`Profile picture of ${user.first_name} ${user.last_name}`}
                        height={150}
                    // priority
                    />
                </div>
                <div className={styles.userInfo}>
                    <h1>{user.first_name} {user.last_name}</h1>
                    <p className={styles.username}>@{user.username}</p>
                    {user.nickname && <p className={styles.nickname}>({user.nickname})</p>}
                    {!user.public && <p className={styles.privateLabel}>(Private Account)</p>}

                    <div className={styles.stats}>
                        <button
                            className={styles.statButton}
                            onClick={() => setShowFollowers(true)}
                        >
                            <span className={styles.count}>{user.followers_count || 0}</span> followers
                        </button>
                        <button
                            className={styles.statButton}
                            onClick={() => setShowFollowing(true)}
                        >
                            <span className={styles.count}>{user.followings_count || 0}</span> following
                        </button>
                    </div>

                    {!isOwnProfile && user.follow_button?.state !== 'none' && (
                        <FollowButton userData={user} />
                    )}
                    {
                        isOwnProfile && 
                            <button className={styles.followButton} onClick={async () => {
                                try {
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/EditProfile`, {
                                        method: "POST",
                                        credentials: "include",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            "user_id": userData.id,
                                            "public": privacy
                                        })
                                    })
                                    if (res.ok) {
                                        setPrivacy(!privacy);
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
        
                            }
                            }>Switch to : {!privacy ? "public" : "private"}</button>                        
                    }
                </div>
            </div>

            {(user.public || isOwnProfile) && (
                <div className={styles.details}>
                    <div className={styles.personalInfo}>
                        <h2>Personal Information</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <strong>First Name:</strong>
                                <span>{user.first_name}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <strong>Last Name:</strong>
                                <span>{user.last_name}</span>
                            </div>
                            {user.nickname && (
                                <div className={styles.infoItem}>
                                    <strong>Nickname:</strong>
                                    <span>{user.nickname}</span>
                                </div>
                            )}
                            {user.birth_day && (
                                <div className={styles.infoItem}>
                                    <strong>Birth Day:</strong>
                                    <span>{user.birth_day}</span>
                                </div>
                            )}
                            {user.gender && (
                                <div className={styles.infoItem}>
                                    <strong>Gender:</strong>
                                    <span>{user.gender}</span>
                                </div>
                            )}
                            {user.email && (
                                <div className={styles.infoItem}>
                                    <strong>Email:</strong>
                                    <span>{user.email}</span>
                                </div>
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
            )}

            <UserListPopup
                key={"followers"}
                isOpen={showFollowers}
                onClose={() => setShowFollowers(false)}
                title="Followers"
                username={user.username}
                followers={followers}
                setFollowers={setFollowers}
                followButtonState={user.follow_button?.state}
            />

            <UserListPopup
                key={"following"}
                isOpen={showFollowing}
                onClose={() => setShowFollowing(false)}
                title="Following"
                username={user.username}
                following={following}
                setFollowing={setFollowing}
                followButtonState={user.follow_button?.state}
            />
            
        </div>
    );
} 