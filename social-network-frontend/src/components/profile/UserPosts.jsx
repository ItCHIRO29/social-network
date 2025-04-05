'use client';

import { useState, useEffect } from 'react';
import Post from '@/components/posts/Post';
import styles from './UserPosts.module.css';

export default function UserPosts({ userId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/user/${userId}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }

                const data = await response.json();
                setPosts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [userId]);

    if (loading) {
        return <div className={styles.loading}>Loading posts...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (posts.length === 0) {
        return <div className={styles.noPosts}>No posts yet</div>;
    }

    return (
        <div className={styles.userPosts}>
            <h2>Posts</h2>
            <div className={styles.postsGrid}>
                {posts.map(post => (
                    <Post key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
} 