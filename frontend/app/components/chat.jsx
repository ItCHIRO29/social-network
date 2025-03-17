import { useEffect, useRef, useState } from "react";
import "../profile/profile.css";

class User {
    constructor(userData) {
        this.userData = userData;
        this.listItemRef = null; 
    }

    setListItemRef(ref) {
        this.listItemRef = ref;
    }
}

export default function Chat({ className, id }) {
    const [users, setUsers] = useState(new Map());
    const listRefs = useRef(new Map()); 

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/users/chat_users', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (!response.ok) {
                    console.log('Error fetching chat data');
                    setUsers(new Map());
                    return;
                }
                const data = await response.json();
                const newUsers = new Map();
                data.forEach((user) => newUsers.set(user.username, new User(user)));
                setUsers(newUsers);
            } catch (error) {
                console.log('Error:', error);
                setUsers(new Map());
            }
        };
        getUsers();
    }, []);

    useEffect(() => {
        users.forEach((userObj, username) => {
            const ref = listRefs.current.get(username);
            userObj.setListItemRef(ref);
        });
    }, [users]); 

    return (
        <div className={className} id={id}>
            <h2>Chat</h2>
            {users.size > 0 ? (
                <ul className="users-list">
                    {Array.from(users.entries()).map(([username, userObj]) => (
                        <li
                            key={username}
                            ref={(el) => listRefs.current.set(username, el)} 
                            className={`list-item ${username}`}
                            
                            
                        >
                            {userObj.userData.firstname} {userObj.userData.lastname}
                        </li>
                    ))}
                </ul>
            ) : (
                <button>No Chats</button>
            )}
        </div>
    );
}