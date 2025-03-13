'use client'
import { useState, useEffect } from "react";
// import Header from "../components/header";
import NavBar from "../components/userActivity";
import "./notifications.css"
export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        async function fetchNotifications() {
            try {
                const response = await fetch('http://localhost:8080/api/notifications/getNotifications', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch notifications');
                }

                const data = await response.json();
                console.log("Notification data:", data);
                setNotifications(data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        }

        fetchNotifications();
    }, []);

    return (
        <main>
            {/* <Header /> */}
            <NavBar />
            <div className="notifications-list">
                {/* <div className="notification"> */}
                {notifications ? notifications.map((notification) => (
                    <div key={notification.id} className="notification">
                        {notification.type == "follow_request" ?
                            <p>{notification.receiver_name} has followed you</p> : <p>XXXXXXX</p>
                        }
                    </div>
                )) : <p>No notifications available.</p>

                }
                {/* </div> */}
            </div>
        </main>
    );
}

// Separate function for fetching notifications (optional)
// export async function FetchNotif() {
//     try {
//         const res = await fetch('http://localhost:8080/api/notifications/', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             credentials: 'include'
//         });

//         if (!res.ok) {
//             throw new Error('Failed to fetch data');
//         }

//         const data = await res.json();
//         console.log(data);
//         return data;
//     } catch (error) {
//         console.error("Error in FetchNotif:", error);
//         return null;
//     }
// }
