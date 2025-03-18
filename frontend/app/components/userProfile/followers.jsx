'use client'
import { useEffect, useState } from "react";

export default function Followers() {
    const [followers, setFollowers] = useState([]);

    useEffect(() => {
        async function fetchFollowers() {
            const data = await GetFollowers();
            setFollowers(data);
            console.log("followers in component :: ", followers);
        }
        fetchFollowers();
    }, []);
    return (
        <>
            {followers ?
                followers.map((follower) => (
                    <div id="follower" key={follower.id}>
                        <img src="images/profile.png" alt="follower" />
                        <p>{follower.username}</p>
                    </div>
                )) : <p>No followers</p>}
        </>
    );
}

export async function GetFollowers() {
    try {
        const response = await fetch(`http://localhost:8080/api/users/followers`, {
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
        // setFollowers(data);
        console.log("followers data :: ", data);
        return data;
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}