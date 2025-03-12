'use client';

import React, { useState } from 'react';
import CommentsSection from './commentsection';

export default function Comments({ postid }) {
    const [showComments, setShowComments] = useState(false);
    const [opened, setOpened] = useState(0);
    const [comments, setComments] = useState([]);

    const handleClick = async (inputElement) => {
        const comment = inputElement.value.trim();

        if (!comment) {
            alert("Please enter a comment.");
            return;
        }
        const newComment = {
            id: Date.now().toString(),
            content: comment,
            // author: , 
            CreatedAt: new Date().toISOString(),
        };
        setComments((prevComments) => [...prevComments, newComment]);
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
            inputElement.value = "";
        } else {
            console.error("Failed to post comment:", res.statusText);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            const inputElement = e.target;
            handleClick(inputElement);
            setShowComments(true);
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
                    setOpened(opened === 1 ? 0 : 1);
                    console.log("opened");
                }}
                style={{ cursor: 'pointer' }}
            />
            {showComments && (
                <CommentsSection key={postid} postid={postid} comments={comments} setComments={setComments} />
            )}
        </div>
    );
}