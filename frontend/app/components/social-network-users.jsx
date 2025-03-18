import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import "../home/home.css"
import AllUsers from "./userProfile/users";

export default function SocialNetworkUsers() {
    let router = useRouter();
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
                router.push("/login");
                throw new Error("Failed to fetch users");
            }

            const data = await response.json();
            //console.log("Fetched Users:", data.users);
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
    //console.log("users :: ", users);
    return (
        <div className="test2">
            <h3>People you might know:</h3>
            <div className="users-list">
                <AllUsers key={`social-network-users`} users={users} />
            </div>
        </div>
    );
}
