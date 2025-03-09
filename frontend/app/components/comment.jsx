'use client';

import React, { useState } from 'react';
import CommentsSection from './commentsection';

export default function Comments({ postid }) {
    const [showComments, setShowComments] = useState(true);
    const [comments, setComments] = useState([]); // State to manage the list of comments

    const handleClick = async (inputElement) => {
        const comment = inputElement.value.trim();

        if (!comment) {
            alert("Please enter a comment.");
            return;
        }

        const res = await fetch("http://localhost:8080/api/comment", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                postid: postid,
                Content: comment,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            console.log("Comment posted successfully!");
            const newComment = {
                id: Date.now().toString(),
                content: comment,
                // author: , // Replace with the actual author name if available
                timestamp: new Date().toISOString(),
            };
            setComments([...comments, newComment]); // Add the new comment to the list
            inputElement.value = ""; // Clear the input field
        } else {
            console.error("Failed to post comment:", res.statusText);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            const inputElement = e.target;
            handleClick(inputElement);
        }
    };

    return (
        <div id="comment">
            <input
                type="text"
                name="comment"
                placeholder="Comment"
                onKeyDown={handleKeyPress}
            />
            <img
                id="comment-icon"
                src="/images/comment-icon.png"
                alt="logo"
                onClick={(e) => {
                    const inputElement = e.target.previousElementSibling;
                    setShowComments(!showComments);
                }}
                style={{ cursor: 'pointer' }}
            />
            {showComments && (
                <CommentsSection postid={postid} comments={comments} setComments={setComments} />
            )}
        </div>
    );
}