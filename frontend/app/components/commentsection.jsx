'use client';

import React, { useEffect, useState } from 'react';

export default function CommentsSection({ postid, comments, setComments }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/comment?post_id=${postid}`, {
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
                setComments(data);
            } catch (e) {
                console.error(e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postid, setComments]);

    if (loading) {
        return <p>Loading comments...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="comment-section">
            <h3>Comments</h3>
            {comments ? (
                <ul className="comment-list">
                    {comments.map((comment) => (
                        <li key={comment.id} className="comment-item">
                            <p><strong>{comment.AuthorName}</strong>: {comment.content}</p>
                            <small>{new Date(comment.CreatedAt).toLocaleString()}</small>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No comments yet.</p>
            )}
        </div>
    );
}