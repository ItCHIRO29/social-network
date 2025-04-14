import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserData } from '../common/providers/userDataContext';
import CreatePost from './CreatePost';
import Post from './Post';
import styles from './Posts.module.css';

export default function Posts({ userId = null, showCreatePost = true }) {
    const { userData } = useUserData();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, [userId, userData]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const url = userId 
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/posts/getPosts?id=${userId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/posts/getPosts`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch posts');
            }

            const data = await response.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.message || 'Failed to fetch posts. Please try again later.');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...(prev || [])]);
    };

    if (loading) {
        return <div className={styles.loading}>Loading posts...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                <button 
                    onClick={fetchPosts}
                    className={styles.retryButton}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className={styles.postsContainer}>
            {showCreatePost && userData && (
                <CreatePost onPostCreated={handlePostCreated} />
            )}
            
            <div className={styles.postsList}>
                {!posts || posts.length === 0 ? (
                    <div className={styles.noPosts}>
                        {userId ? 'No posts yet' : 'No posts to show'}
                    </div>
                ) : (
                    posts.map(post => (
                        <Post key={post.ID} post={post} />
                    ))
                )}
            </div>
        </div>
    );
} 