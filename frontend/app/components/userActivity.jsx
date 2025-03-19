'use client';
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";


export default function NavBar() {

    let router = useRouter();
    const handleClick = (e) => {
        e.preventDefault();
        if (e.target.id === "Profile") {
            DeleteUneusedCss();
            router.push("/profile?id=0");
        } else if (e.target.id === "Home") {
            DeleteUneusedCss();
            router.push("/home");
        } else if (e.target.id === "Groups") {
            DeleteUneusedCss();
            router.push("/groups");
        } else if (e.target.id === "Logout") {
            fetch("http://localhost:8080/api/auth/logout", {
                method: "POST",
                credentials: "include",
            })
                .then((response) => {
                    if (response.ok) {
                        router.push("/");
                    } else {
                        console.error("Logout failed");
                    }
                })
                .catch((error) => {
                    console.error("Error during logout:", error);
                });
            router.push("/login");
        }
    }
    return (
        <>
            <div className="nav" onClick={handleClick}>
                <button id="Home" type="submit">Home</button>
                <button id="Profile" type="submit" >Profile</button>
                <button id="Groups" type="submit">Groups</button>
                <button id="Logout" type="submit" >Logout</button>
            </div >
        </>
    );
}

export function DeleteUneusedCss() {
    const links = document.head.querySelectorAll("link");

    if (links.length === 0) {
        console.log("No assets found in <head>.");
        return;
    }

    // console.log("Assets in <head>:");
    links.forEach(link => {
        const rel = link.getAttribute("rel");
        const href = link.getAttribute("href");
        if (rel === "stylesheet" && !href.includes("layout.css")) {
            link.remove();
        }
    });
}


// export { FetchData };