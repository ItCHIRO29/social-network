import React, { useState, useEffect } from 'react';


export default function Header() {
    const handleHomeRoute = (e) => {
        e.preventDefault();
        window.location.href = "/home";
    }
    const [notif, setNotif] = useState(null);
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
    useEffect(() => {
        const newNotif = document.createElement('div');
        newNotif.style.display = 'none';
        newNotif.className = 'notification';
        notifications ? notifications.map((notifi) => {
            console.log("notifi :: ", notifi);
            {
                notifi.type == "follow_request" ?
                    newNotif.innerHTML = `
                <div class="notification-item">
                    <img src="http://localhost:8080/${notifi.image}" width=${70} height=${70} alt="profile-pic" class="profile-pic">
                    <p>${notifi.receiver_name} has followed you</p>
                    <div class="right">
                        <button class="accept">Accept</button>
                        <button class="refuse">Reject</button>
                    </div>
                </div>
                ` : null
            }
        }) : null
        document.body.appendChild(newNotif);
        setNotif(newNotif);
    }, [notifications.length]);

    // main.appendChild(notif);
    return (
        <>
            <header>
                <img className="logo" src="images/SN-logo1.png" alt="logo" onClick={handleHomeRoute} />
                <input type="search" id="search-input" placeholder="Search" />
                <div className="right">

                    <img className="notif-icon" src="images/notif.png" alt="profile" onClick={(e) => {
                        ShowNotifications(notif)
                    }} />
                    <h1>Social Network</h1>
                </div>
            </header>
        </>
    );
}

function ShowNotifications(notif) {
    console.log("notif :", notif);
    if (notif.style.display == 'none') {
        notif.style.display = 'flex';
    } else {
        notif.style.display = 'none';
    }
}

// export default function NotificationsPage() {
//     const [notifications, setNotifications] = useState([]);
//     useEffect(() => {
//         async function fetchNotifications() {
//             try {
//                 const response = await fetch('http://localhost:8080/api/notifications/getNotifications', {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json'
//                     },
//                     credentials: 'include'
//                 });

//                 if (!response.ok) {
//                     throw new Error('Failed to fetch notifications');
//                 }

//                 const data = await response.json();
//                 console.log("Notification data:", data);
//                 setNotifications(data);
//             } catch (error) {
//                 console.error("Error fetching notifications:", error);
//             }
//         }

//         fetchNotifications();
//     }, []);

//     return (
//         <main>
//             {/* <Header /> */}
//             <NavBar />
//             <div className="notifications-list">
//                 {/* <div className="notification"> */}
//                 {notifications ? notifications.map((notification) => (
//                     <div key={notification.id} className="notification">
//                         {notification.type == "follow_request" ?
//                             <p>{notification.receiver_name} has followed you</p> : <p>XXXXXXX</p>
//                         }
//                     </div>
//                 )) : <p>No notifications available.</p>

//                 }
//                 {/* </div> */}
//             </div>
//         </main>
//     );
// }