'use client'
import EditP from "../components/EditProfile";
import Header from "../components/header";
import UserActivity from "../components/userActivity";
import "./edit.css"
export default function EditProfile() {
    return (
        <>
            <main id="main1">
                <Header />
                <UserActivity />
                <div className="userInfo">
                    <div className="left-infos">
                        {/* <img className="profile-image" src={imagePath} alt="Profile" /> */}
                        {/* <h1>{userData.first_name}</h1> */}
                    </div>
                </div>
                <div className="test1" id="chat">
                    <h2>Chats</h2>
                    <button >John Doe</button>
                    <button >Jane Doe</button>
                    <button >John Smith</button>
                    <button >Jane Smith</button>
                </div>
                <EditP />
                <div className="followers">
                    <h2>Followers</h2>
                    <div id="follower">
                        <img src="/images/profile.png" alt="Profile" />
                        <button>John Doe</button>
                    </div>
                    <div id="follower">
                        <img src="/images/profile.png" alt="Profile" />
                        <button>Jane Jenny</button>
                    </div>
                    <div id="follower">
                        <img src="/images/profile.png" alt="Profile" />
                        <button>John Smith</button>
                    </div>
                    <div id="follower">
                        <img src="/images/profile.png" alt="Profile" />
                        <button>Jane Smith</button>
                    </div>
                    <div id="follower">
                        <img src="/images/profile.png" alt="Profile" />
                        <button>Sam Smith</button>
                    </div>
                </div>
            </main>
        </>

    );
}