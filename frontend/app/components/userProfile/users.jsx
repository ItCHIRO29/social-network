'use client';

import { useRouter } from "next/navigation";

export default function AllUsers(userInfo) {
    let router = useRouter();
    let allusers = userInfo.users;
    const clickProfile = async (id) => {
        router.push(`/profile?id=${id}`);
    }
    const imagePath = "./images/profile.png"
    return (
        <>
            {
                allusers.length > 0 ? (
                    allusers.map((user) => (
                        <div id="follower-section" key={user.id} className="user-card">
                            <img src={user.image ? `http://localhost:8080/${user.image}` : imagePath} alt="Profile" />
                            <button onClick={() => clickProfile(user.id)} >{user.full_name}</button>
                        </div>
                    ))
                ) : (
                    <p>No users found.</p>
                )
            }
        </>

    );
}
