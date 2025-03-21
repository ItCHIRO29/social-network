"use client";
import { React } from "react";
import { useState, useEffect } from 'react';
import CreatePost from "../components/postsComponents/posts";
import NavBar from "../components/userActivity";
import Header from "../components/header";
import SocialNetworkUsers from "../components/social-network-users";
import { useRouter } from "next/navigation";
import "./home.css"
import {ChatManager} from '../components/chatComponents/ChatManager.jsx';

export default function HomeP() {
    const router = useRouter();
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
        <main key={`home-main-${userData.id}`}>
            <Header />
            <CreatePost key={`home-createPost-${userData.id}`} userImage={imagePath} userId={0} />
            <SocialNetworkUsers key={`home-socialNetworkUsers-${userData.id}`} />
            <NavBar key={`home-navBar-${userData.id}`} />
            {/* <ChatWindowsContainer></ChatWindowsContainer> */}
            <ChatManager className={"test1"} id={"chat1"} userData={userData}></ChatManager>
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
            //console.log("data :: ", data);
            return data; // Return the resolved object
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        return null; // Handle errors gracefully
    }
}
