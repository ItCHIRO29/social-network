import { useState } from 'react';
import styles from './Comments.module.css';

export default function Comments({ postId }) {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);

    const handleComment = async (inputElement) => {
        const comment = inputElement.value.trim();
        if (!comment) {
            alert("Please enter a comment.");
            return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comment`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                postid: postId,
                Content: comment,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            const newComment = await res.json();
            setComments((prevComments) => [...prevComments, newComment]);
            inputElement.value = "";
        } else {
            console.error("Failed to post comment:", res.statusText);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleComment(e.target);
            setShowComments(true);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comment?post_id=${postId}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) {
                throw new Error("Failed to fetch comments");
            }
            const data = await res.json();
            setComments(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleComments = () => {
        const newShowComments = !showComments;
        setShowComments(newShowComments);
        if (newShowComments) {
            fetchComments();
        }
    };

    return (
        <div className={styles.commentsSection}>
            <div className={styles.commentInput}>
                <input
                    type="text"
                    placeholder="Write a comment..."
                    onKeyDown={handleKeyPress}
                    className={styles.input}
                />
            </div>
            
            <button 
                className={styles.toggleButton}
                onClick={toggleComments}
            >
                {showComments ? 'Hide Comments' : 'Show Comments'}
            </button>

            {showComments && (
                <div className={styles.commentsList}>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.ID} className={styles.commentItem}>
                                <div className={styles.commentHeader}>
                                    <strong className={styles.authorName}>{comment.AuthorName}</strong>
                                    <span className={styles.timestamp}>
                                        {new Date(comment.CreatedAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className={styles.commentContent}>{comment.content}</p>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noComments}>No comments yet.</p>
                    )}
                </div>
            )}
        </div>
    );
} 