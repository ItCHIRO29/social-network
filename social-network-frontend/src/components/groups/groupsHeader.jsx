'use client'
import { useState, useEffect } from "react";
import styles from "./groupsHeader.module.css";

export default function GroupsHeader() {
    const [activeButton, setActiveButton] = useState("all groups");
    const [groups, setGroups] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        fetchGroups();
        // Reset create form when switching tabs
        if (activeButton !== 'your groups') {
            setShowCreateForm(false);
            setNewGroupName('');
            setNewGroupDescription('');
            setSelectedUsers([]);
        }
    }, [activeButton]);

    useEffect(() => {
        if (showCreateForm) {
            fetchUsers();
        }
    }, [showCreateForm]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/users/GetAllUsers', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleUserSelect = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const fetchGroups = async () => {
        try {
            let endpoint = '';
            switch(activeButton) {
                case 'your groups':
                    endpoint = '/api/groups/created';
                    break;
                case 'joined groups': 
                    endpoint = '/api/groups/joined';
                    break;
                default:
                    endpoint = '/api/groups/getGroups/all';
            }
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + endpoint, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setGroups(data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/groups/createGroup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: newGroupName,
                    description: newGroupDescription,
                    invitedUsers: selectedUsers
                })
            });
            if (response.ok) {
                setShowCreateForm(false);
                setNewGroupName('');
                setNewGroupDescription('');
                setSelectedUsers([]);
                fetchGroups();
            }
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleJoinGroup = async (groupId) => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/groups/${groupId}/join`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to join group');
            }
            fetchGroups();
        } catch (error) {
            console.error('Error joining group:', error);
        }
    };

    const handleLeaveGroup = async (groupId) => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/groups/${groupId}/leave`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to leave group');
            }
            fetchGroups();
        } catch (error) {
            console.error('Error leaving group:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${activeButton === 'your groups' ? styles.active : ''}`}
                        onClick={() => setActiveButton('your groups')}
                    >
                        Your Groups
                    </button>
                    <button 
                        className={`${styles.tab} ${activeButton === 'joined groups' ? styles.active : ''}`}
                        onClick={() => setActiveButton('joined groups')}
                    >
                        Joined Groups
                    </button>
                    <button 
                        className={`${styles.tab} ${activeButton === 'all groups' ? styles.active : ''}`}
                        onClick={() => setActiveButton('all groups')}
                    >
                        All Groups
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                {activeButton === 'your groups' && (
                    <>
                        {!showCreateForm ? (
                            <button 
                                className={styles.createButton}
                                onClick={() => setShowCreateForm(true)}
                            >
                                Create New Group
                            </button>
                        ) : (
                            <div className={styles.createForm}>
                                <h3>Create New Group</h3>
                                <form onSubmit={handleCreateGroup}>
                                    <input
                                        type="text"
                                        placeholder="Group Name"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        required
                                    />
                                    <textarea
                                        placeholder="Group Description"
                                        value={newGroupDescription}
                                        onChange={(e) => setNewGroupDescription(e.target.value)}
                                        required
                                    />
                                    
                                    <div className={styles.inviteSection}>
                                        <h4>Invite Users</h4>
                                        <div className={styles.usersList}>
                                            {users.map(user => (
                                                <label key={user.id} className={styles.userItem}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={() => handleUserSelect(user.id)}
                                                    />
                                                    <span className={styles.checkmark}></span>
                                                    <span className={styles.username}>{user.username}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.formActions}>
                                        <button type="submit">Create</button>
                                        <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {groups.length === 0 ? (
                            <div className={styles.emptyState}>
                                You haven't created any groups yet
                            </div>
                        ) : (
                            <div className={styles.groupsGrid}>
                                {groups.map(group => (
                                    <div key={group.id} className={styles.groupCard}>
                                        <h3>{group.name}</h3>
                                        <p>{group.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeButton !== 'your groups' && (
                    <>
                        {groups.length === 0 ? (
                            <div className={styles.emptyState}>
                                No groups found in this section
                            </div>
                        ) : (
                            <div className={styles.groupsGrid}>
                                {groups.map(group => (
                                    <div key={group.id} className={styles.groupCard}>
                                        <h3>{group.name}</h3>
                                        <p>{group.description}</p>
                                        <div className={styles.groupActions}>
                                            {activeButton === 'all groups' && (
                                                <button 
                                                    className={styles.joinButton}
                                                    onClick={() => handleJoinGroup(group.id)}
                                                >
                                                    Join Group
                                                </button>
                                            )}
                                            {activeButton === 'joined groups' && (
                                                <button 
                                                    className={styles.leaveButton}
                                                    onClick={() => handleLeaveGroup(group.id)}
                                                >
                                                    Leave Group
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}