"use client";
import { useState, useEffect, Suspense } from 'react';
import CreatePost from "../components/postsComponents/posts";
import UserActivity from "../components/userActivity";
import Header from '../components/header';
import AboutUser from '../components/userProfile/aboutUser';
import Chat from '../components/chatComponents/chat';
import "./profile.css"
import { useSearchParams } from 'next/navigation';
import { useRouter } from "next/navigation";
function Profile() {
    const router = useRouter();
    const [userData, setUserData] = useState({});
    const searchParams = useSearchParams();
    const id = searchParams.get('id');


    useEffect(() => {
        async function fetchUser() {
            const data = await FetchData("profile", id);
            setUserData(data);
        }
        fetchUser();
    }, []);


    const imagePath = userData.image ? `http://localhost:8080${userData.image.replace('./', '/')}` : './images/profile.png';
    return (
        <>
            <main key={`profile-main-${userData.id}`}>
                <Header />
                <UserActivity />
                <AboutUser userData={userData} imagePath={imagePath} id={id} />
                <CreatePost userImage={imagePath} userId={id} />
            </main>
        </>

    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Profile />
        </Suspense>
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
                //console.log("response :: ", response);
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


