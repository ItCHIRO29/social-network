

export default function NavBar() {
    const handleClick = (e) => {
        e.preventDefault();
        if (e.target.id === "Profile") {
            window.location.href = "/profile?id=0";
        } else if (e.target.id === "Home") {
            window.location.href = "/home";
        } else if (e.target.id === "Notifications") {
            window.location.href = "/notifications";
        } else if (e.target.id === "Groups") {
            window.location.href = "/groups";
        } else if (e.target.id === "Followers") {
            window.location.href = "/followers";
        } else if (e.target.id === "Logout") {
            fetch("http://localhost:8080/api/auth/logout", {
                method: "POST",
                credentials: "include",
            })
                .then((response) => {
                    if (response.ok) {
                        window.location.href = "/";
                    } else {
                        console.error("Logout failed");
                    }
                })
                .catch((error) => {
                    console.error("Error during logout:", error);
                });
            window.location.href = "/login";
        }
    }
    return (
        <>
            <div className="nav" onClick={handleClick}>
                <button id="Home" type="submit">Home</button>
                <button id="Profile" type="submit" >Profile</button>
                <button id="Notifications" type="submit">Notifications</button>
                <button id="Groups" type="submit">Groups</button>
                <button id="Followers" type="submit">Followers</button>
                <button id="about" type="submit">about</button>
                <button id="Logout" type="submit" >Logout</button>
            </div >
        </>
    );
}


// export { FetchData };