import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import "../../profile/profile.css";

export default function AboutUser({ userData, imagePath }) {
    const handleEditProfile = () => {
        window.location.href = "/editProfile";
    };
    // handleFollowers()
    // handleFollowing()
    // const followers = document.getElementById("followers");
    // const following = document.getElementById("following");
    // console.log("followers ===> ", followers);
    // console.log("following ===> ", following);
    return (
        
        <div className="userInfo">
            <div className="left-infos">
                <img className="profile-image" src={imagePath} alt="Profile" />
                <div className="bio">
                    <h1>{userData.first_name} {userData.last_name}</h1>
                    {userData.public == true ?
                        <>
                            <div className="center-user-infos" >
                                <p>First Name: {userData.first_name}</p>
                                <p>Last Name: {userData.last_name}</p>
                                <p>Age: {userData.age}</p>
                                <p>Gender: {userData.gender}</p>
                                <p>Email: {userData.email}</p>
                                <p>Bio: {userData.bio}</p>
                            </div>
                        </>
                        :
                        <>
                            <div className="center-user-infos" >
                                <p>First Name: {userData.first_name}</p>
                                <p>Last Name: {userData.last_name}</p>
                            </div>
                        </>
                    }
                    {userData.public == false ? <h2>(Private Account)</h2> : null}
                </div>
                <button className="commentButtons" type="button" onClick={() => { Show("followers", "following") }}>(10)Followres</button>
                <button className="commentButtons" type="button" onClick={() => { Show("following", "followers") }}>(12)Following</button>
                <FollowButton key={`followButton-${userData.id}`} userData={userData} />
                
            </div>
            <div className="right-buttons">
                <button className="commentButtons" onClick={handleEditProfile} >
                    <FontAwesomeIcon icon={faGear} className="settings" />
                    Edit Profile
                </button>
            </div>
        </div>
    );
}

function FollowButton({ userData}) {
    const followButton = userData.follow_button
    if (!followButton || followButton.state === 'none') {
        return null
    }
    const [followState, setFollowState] = useState("");
    const [referenceId, setReferenceId] = useState(followButton.reference_id);
    useEffect(() => {
        if (followState === "" && followButton?.state) {
            setFollowState(followButton.state)

        }
    }, [followButton, followState, setFollowState]);
     

    const handleFollow = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/follow?username=${userData.username}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setReferenceId(data.reference_id);
            setFollowState(data.state);
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    }

    const handleUnfollow = async (reference_id) => {
        console.log("reference_id :: ", reference_id);
        try {
            const response = await fetch(`http://localhost:8080/api/users/follow?reference_id=${reference_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            setFollowState("follow");
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    }

    const handleClick = async () => {
        if (followState === "follow") {
            handleFollow(userData.username);
        } else if (followState === "pending" || followState === "unfollow") {
            await handleUnfollow(referenceId)
        }
    }

    return (
        <button className='commentButtons' onClick={handleClick}>
            {followState == "follow" ? "Follow" : ''}
            {followState == "unfollow" ? "Unfollow" : ''}
            {followState == "pending" ? "Cancel Request" : ''}
        </button>
    )

}
function handleFollowers() {
    useEffect(() => {
        let FollowersList = document.createElement('div');
        FollowersList.id = 'followers';
        FollowersList.style.display = 'none';
        FollowersList.className = 'followers';
        {
            FollowersList.innerHTML = `
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
                    `
        }
        document.body.appendChild(FollowersList);
    }, []);
    return Followe
}
function handleFollowing() {
    useEffect(() => {
        const following = document.createElement('div');
        following.id = 'following';
        following.style.display = 'none';
        following.className = 'following';
        // Show(following);
        // notifications ? notifications.map((notifi) => {
        // console.log("notifi :: ", notifi);
        {
            // notifi.type == "follow_request" ?
            following.innerHTML = `
            <h2>Following</h2>
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
                `
            //  : null
        }
        // }) : null
        document.body.appendChild(following);
        // setFollowing(following);
    }, []);
}
function Show(id1, id2) {
    const target1 = document.getElementById(id1);
    const target2 = document.getElementById(id2);

    if (target1.style.display === "none" || target1.style.display === "") {
        target1.style.display = "flex";
        target2.style.display = "none";
    } else {
        target1.style.display = "none";
    }
}