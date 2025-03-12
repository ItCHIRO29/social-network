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
                setComments(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [postid, setComments]); // Re-fetch comments when postid changes

    if (loading) {
        return <p>Loading comments...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <>
            {comments ?
                <>
                    <div className="comment-section" >
                        <h3>Comments :</h3>
                        <div className="comment-list">
                            {comments.map((comment) => (
                                console.log(comment),
                                <div key={comment.ID} className="comment-item"> {/* Add unique key */}
                                    <h3><strong>{comment.AuthorName}</strong></h3>
                                    <small>{new Date(comment.CreatedAt).toLocaleString()}</small>
                                    <p>{comment.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
                :
                <>
                    <h3>Comments :</h3>
                    <p>No comments yet.</p>
                </>
            }
        </>
    );
}