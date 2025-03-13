"use client";
import { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faGear } from '@fortawesome/free-solid-svg-icons';
import CreatePost from "../components/postsComponents/posts";
import UserActivity from "../components/userActivity";
import Header from '../components/header';
import CreateGroup from '../components/groupsComponents/createGroup';
import AboutUser from '../components/userProfile/aboutUser';
import "./profile.css"

export default function ProfilePage() {
    const url = window.location.href;
    console.log("url :: ", url);
    const id = url.split("=")[1];
    console.log("id :: ", id);
    const [userData, setUserData] = useState({}); // Store user data


    useEffect(() => {
        async function fetchUser() {
            if (id == 0) {
                const data = await FetchData("profile", 0);
                setUserData(data);
            } else {
                const data = await FetchData("profile", id);
                setUserData(data);
            }
            // const data = await FetchData("profile", id);
            // setUserData(data);
        }
        fetchUser();
    }, []);
    // const handleEditProfile = () => {
    //     window.location.href = "/editProfile";
    // };
    const imagePath = userData.image ? `http://localhost:8080${userData.image.replace('./', '/')}` : './images/profile.png';
    console.log("userData :: ", userData);
    return (
        <>
            <main>
                <Header />
                <UserActivity />
                {/* <div className="userInfo">
                    <div className="left-infos">
                        <img className="profile-image" src={imagePath} alt="Profile" />
                        <h1>{userData.first_name} {userData.last_name}</h1>
                        {userData.public == false ? <h2>(Private Account)</h2> : null}
                        <FollowButton userData={userData} followState={followState} setFollowState={setFollowState} />
                    </div>
                    <div className="right-buttons">
                        <button className="commentButtons" onClick={handleEditProfile} >
                            <FontAwesomeIcon icon={faGear} className="settings" />
                            Edit Profile
                        </button>
                    </div>
                </div> */}
                <AboutUser userData={userData} imagePath={imagePath} />
                <div className="test1" id="chat">
                    <h2>Chats</h2>
                    <button >John Doe</button>
                    <button >Jane Doe</button>
                    <button >John Smith</button>
                    <button >Jane Smith</button>
                </div>
                <CreatePost userImage={imagePath} userId={id} />
                {/* <CreateGroup /> */}
                {/* <FollowersComponent /> */}
                {/* <div className='test2'>
                    {userData.public == true ?
                        <>
                            <h2>about1</h2>
                            <div className="center-user-infos" >
                                <p>First Name: {userData.first_name}</p>
                                <p>Last Name: {userData.last_name}</p>
                                <p>Age: {userData.age}</p>
                                <p>Gender: {userData.gender}</p>
                                <p>Email: {userData.email}</p>
                                <p>Profile: Public</p>
                                <p>Bio: {userData.bio}</p>
                            </div>
                        </>
                        :
                        <>
                            <h2>about2</h2>
                            <div className="center-user-infos" >
                                <p>First Name: {userData.first_name}</p>
                                <p>Last Name: {userData.last_name}</p>
                                <p>Profile: Private</p>
                            </div>
                        </>
                    }

                </div> */}
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
                window.location.href = "/login";
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