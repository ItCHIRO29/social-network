"use client";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import CreatePost from "../components/posts";
import UserActivity from "../components/userActivity";

export default function ProfilePage() {
    const handleEditProfile = () => {
        window.location.href = "/editProfile";
    };
    return (
        <>
            <UserActivity />
            <div className="userInfo">
                <div className="left-infos">
                    <img className="profile-image" src="/images/profile.png" alt="Profile" />
                    <h2>Iichi</h2>
                </div>
                <div className="center-user-infos">
                    <h2>First Name: iichi</h2>
                    <h2>Last Name: iichi</h2>
                    <h2>Age: 20</h2>
                    <h2>Email: ii@gmail.com</h2>
                    <h2>Bio: iichi</h2>
                </div>
                <div className="right-buttons">
                    <button className="commentButtons" onClick={handleEditProfile} >
                        <FontAwesomeIcon icon={faGear} className="settings" />
                        Edit Profile
                    </button>

                </div>
            </div>
            <CreatePost />
        </>
    );
}
