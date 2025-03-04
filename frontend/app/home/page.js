"use client";
import { React } from "react";
import CreatePost from "../components/posts";
import UserActivity from "../components/userActivity";
import Header from "../components/header";
import "./home.css"
// import FetchData from "../profile/page";
import { useState, useEffect } from 'react';
import Post from "../components/post";

export default function HomeP() {
    const [userData, setUserData] = useState({}); // Store user data

    useEffect(() => {
        async function fetchUser() {
            const data = await FetchData("profile");
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
            <CreatePost userImage={imagePath} />
            {/* <Post /> */}
            <div className="test2">
                <h3>People you might know : </h3>
                <div className="center-user-infos">
                    <button >ismail ICHI</button>
                    <button >Ayoub ElHeddad</button>
                    <button >Youssef Ehajjaoui</button>
                    <button >Ibrahim Benso</button>
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
            </div>
            <UserActivity />
        </main>
    );
}
async function FetchData(id) {
    try {
        if (id === "profile") {
            const response = await fetch("http://localhost:8080/api/users/profile", {
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

