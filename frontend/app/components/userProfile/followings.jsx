'use client'
import React from 'react';
import { useState, useEffect } from "react";

export default function Followings() {
    const [followings, setFollowings] = useState([]);
    useEffect(() => {
        async function fetchFollowing() {
            const data = await GetFollowing();
            setFollowings(data);
        }
        fetchFollowing();
    }, []);
    return (
        <>
            {followings ?
                followings.map((following) => (
                    <div id="follower" key={following.id}>
                        {/* <div > */}
                        <img src="images/profile.png" alt="follower" />
                        <p>{following.username}</p>
                        {/* </div> */}
                    </div>
                )) : <p style={{ color: "black" }}>No following</p>}
        </>
    );
}

// GetFollowers();
async function GetFollowing() {
    try {
        const response = await fetch(`http://localhost:8080/api/users/following`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            return [];
        }
        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}
