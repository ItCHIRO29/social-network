import { useState, useEffect } from "react";
// import "../home/home.css"
import AllUsers from "./users";

export default function SocialNetworkUsers() {
    const [users, setUsers] = useState([]);

    const getUsers = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/users/GetAllUsers", {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                window.location.href = "/login";
                throw new Error("Failed to fetch users");
            }

            const data = await response.json();
            console.log("Fetched Users:", data.users);
            return data.users || []; // Ensure it's always an array
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    };

    useEffect(() => {
        async function fetchUsers() {
            const data = await getUsers();
            setUsers(data);
        }
        fetchUsers();
    }, []);
    console.log("users :: ", users);
    return (
        <div className="test2">
            <h3>People you might know:</h3>
            <div className="users-list">
                <AllUsers users={users} />
            </div>
        </div>
    );
}
