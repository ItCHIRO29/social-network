"use client";
import Header from "../components/header";
import CreatePost from "../components/postsComponents/posts";
import NavBar from "../components/userActivity";
import "./groupActivity.css"

export default function GroupActivity() {
    return (
        <main>
            <Header />
            <NavBar />
            <div className="groupInfo">
                <div className="left-infos">
                    <img className="profile-image" src="/images/profile.png" alt="Profile" />
                    {/* <h1>{userData.first_name} {userData.last_name}</h1> */}
                    {/* {userData.public == false ? <h2>(Private Account)</h2> : null} */}
                    {/* <FollowButton userData={userData} followState={followState} setFollowState={setFollowState} /> */}
                </div>
            </div>
            {/* <CreatePost userImage={""} userId={group.AdminId} /> */}
        </main>
    )
}