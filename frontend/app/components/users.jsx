'use client';

export default function AllUsers(userInfo) {
    let allusers = userInfo.users;
    const clickProfile = async (id) => {
        window.location.href = `/profile?id=${id}`;
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
