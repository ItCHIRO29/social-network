import ProfileButton from "./profileRoute";
export default function UserActivity() {
    // console.log("styling:", className);
    const handleClick = (e) => {
        e.preventDefault();
        if (e.target.id === "Profile") {
            window.location.href = "/profile";
        } else if (e.target.id === "Home") {
            window.location.href = "/home";
        } else if (e.target.id === "Chat") {
            window.location.href = "/chat";
        } else if (e.target.id === "Groups") {
            window.location.href = "/groups";
        } else if (e.target.id === "Followers") {
            window.location.href = "/followers";
        } else if (e.target.id === "Logout") {
            window.location.href = "/login";
        }
    }
    return (
        <>
            <div className="nav" onClick={handleClick}>
                {/* <ProfileButton /> */}
                <button /* className="btn" */ id="Home" type="submit">Home</button>
                <button /* className="btn" */ id="Profile" type="submit" >Profile</button>
                <button /* className="btn" */ id="Chat" type="submit">Chat</button>
                <button /* className="btn" */ id="Groups" type="submit">Groups</button>
                <button /* className="btn" */ id="Followers" type="submit">Followers</button>
                <button /* className="btn" */ id="about" type="submit">about</button>
                <button /* className="btn" */ id="Logout" type="submit" >Logout</button>
            </div >
        </>
    );
}