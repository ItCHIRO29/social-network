"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import CreatePost from "../components/posts";
import UserActivity from "../components/userActivity";
import "./profile.css"
import Header from '../components/header';
export default function ProfilePage() {
    const handleEditProfile = () => {
        window.location.href = "/editProfile";
    };
    return (
        <>
            <main>
                <Header />
                <UserActivity />
                <div className="userInfo">
                    <div className="left-infos">
                        <img className="profile-image" src="/images/profile.png" alt="Profile" />
                        <h1>Iichi</h1>
                    </div>
                    <div className="right-buttons">
                        <button className="commentButtons" onClick={handleEditProfile} >
                            <FontAwesomeIcon icon={faGear} className="settings" />
                            Edit Profile
                        </button>

                    </div>
                </div>
                <div className='test1'></div>
                <CreatePost />
                <div className='test2'>
                    <h2>about</h2>
                    <div className="center-user-infos">
                        <p>First Name: iichi</p>
                        <p>Last Name: iichi</p>
                        <p>Age: 20</p>
                        <p>Email: ii@gmail.com</p>
                        <p>Bio: iichi</p>
                    </div>
                </div>
            </main>
        </>

    );
}
