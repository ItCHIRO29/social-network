"use client";
import { React } from "react";
import { useState, useEffect } from 'react';
import CreatePost from "../components/posts";
import NavBar from "../components/userActivity";
import Header from "../components/header";
import SocialNetworkUsers from "../components/social-network-users";
import "./home.css"

export default function HomeP() {
    const [userData, setUserData] = useState({}); // Store user data

    useEffect(() => {
        async function fetchUser() {
            const data = await FetchData("profile", 0);
            setUserData(data);
        }
        fetchUser();
    }, []);
    const imagePath = userData.image ? `http://localhost:8080${userData.image.replace('./', '/')}` : './images/profile.png';

    return (
        <main>
            <Header />
            <div className="test1" id="chat">
                <h2>Chats</h2>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
            </div>
            <div className="test3" id="followers">
                <h2>Followers</h2>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
            </div>
            <CreatePost userImage={imagePath} userId={0} />
            <SocialNetworkUsers />
            <NavBar />
        </main>
    );
}
async function FetchData(category, id) {
    try {
        if (category === "profile") {
            const response = await fetch(`http://localhost:8080/api/users/profile?id=${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("data :: ", data);
            return data; // Return the resolved object
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        return null; // Handle errors gracefully
    }
}

