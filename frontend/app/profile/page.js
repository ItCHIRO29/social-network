"use client";
import { useState, useEffect } from 'react';
import CreatePost from "../components/postsComponents/posts";
import UserActivity from "../components/userActivity";
import Header from '../components/header';
import AboutUser from '../components/userProfile/aboutUser';
import Chat from '../components/chat';
import "./profile.css"
import { useSearchParams } from 'next/navigation';
import { useRouter } from "next/navigation";

export default function ProfilePage() {
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
            <main  key={`profile-main-${userData.id}`}>
                <Header/>
                <UserActivity />
                <AboutUser userData={userData} imagePath={imagePath} id={id} />
                <CreatePost userImage={imagePath} userId={id} />
                <Chat className={"test1"} id={"chat"} />
            </main>
        </>

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
                console.log("response :: ", response);
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



// function FollowersComponent() {
//     return (
//         <div className="followers">
//             <h2>Followers</h2>
//             <div id="follower">
//                 <img src="/images/profile.png" alt="Profile" />
//                 <button>John Doe</button>
//             </div>
//             <div id="follower">
//                 <img src="/images/profile.png" alt="Profile" />
//                 <button>Jane Jenny</button>
//             </div>
//             <div id="follower">
//                 <img src="/images/profile.png" alt="Profile" />
//                 <button>John Smith</button>
//             </div>
//             <div id="follower">
//                 <img src="/images/profile.png" alt="Profile" />
//                 <button>Jane Smith</button>
//             </div>
//             <div id="follower">
//                 <img src="/images/profile.png" alt="Profile" />
//                 <button>John Doe</button>
//             </div>
//             <div id="follower">
//                 <img src="/images/profile.png" alt="Profile" />
//                 <button>Jane Jenny</button>
//             </div>
//             <div id="follower">
//                 <img src="/images/profile.png" alt="Profile" />
//                 <button>John Smith</button>
//             </div>
//             <div id="follower">
//                 <img src="/images/profile.png" alt="Profile" />
//                 <button>Jane Smith</button>
//             </div>
//         </div>
//     )
// }

export { FetchData };