'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './group.module.css';
import GroupNavigation from '../../../components/groups/GroupNavigation';
import Posts from '../../../components/posts/groupPosts'
// import CreateGrpPost from '../../../components/posts/CreateGrpPost';
export default function GroupPage() {
    const { name: groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [posts, setPosts] = useState([]);


    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            // Fetch group details
            const groupResponse = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/groups/${groupId}`, {
                credentials: 'include',
            });

            if (groupResponse.ok) {
                const groupData = await groupResponse.json();
                console.log('groupData to posts ===>',groupData)
                setGroup(groupData);
            }

            // Fetch group members
            const membersResponse = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/groups/${groupId}/members`, {
                credentials: 'include',
            });

            if (membersResponse.ok) {
                const membersData = await membersResponse.json();
                setMembers(membersData);
            }
        } catch (error) {
            console.error('Error fetching group details:', error);
        } finally {
            setLoading(false);
        }
    };
    // const handlePostCreated = (newPost) => {
    //     setPosts(prev => [newPost, ...(prev || [])]);
    // };
    return (
        <div className={styles.groupContainer}>
            <div className={styles.header}>
                <h1>Group</h1>
            </div>
            <Posts groupId={groupId} />
            {loading ? (
                <div className={styles.loading}>Loading group details...</div>
            ) : group ? (
                <>
                    <div className={styles.groupInfo}>
                        <h2 className={styles.groupTitle}>{group.name}</h2>
                        <p className={styles.groupDescription}>{group.description}</p>

                        <div className={styles.membersSection}>
                            <h3>Members ({members.length})</h3>
                            <div className={styles.membersList}>
                                {members.map(member => (
                                    <div key={member.id} className={styles.memberItem}>
                                        <div className={styles.memberAvatar}>
                                            {member.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={styles.memberName}>{member.username}</span>
                                        {member.is_admin && (
                                            <span className={styles.adminBadge}>Admin</span>
                                        )}
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <p className={styles.noMembers}>No members found</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <GroupNavigation groupId={groupId} activeTab="overview" />

                    <div className={styles.postsSection}>
                        {/* Group posts content will go here */}
                        <p className={styles.placeholderText}>Group posts will display here</p>
                    </div>
                </>
            ) : (
                <div className={styles.error}>Group not found</div>
            )}
        </div>
    );
}
