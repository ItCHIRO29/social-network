import { useEffect, useRef, useState } from "react";
import "../profile/profile.css";

class User {
    constructor(userData) {
        this.userData = userData;
    }

    addProperty(key, value) {
        this.userData[key] = value;
    }
}

export default function Chat({ className, id }) {
    const [users, setUsers] = useState(new Map());
    const [data, setData] = useState([]);
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
                setData(data);
            } catch (error) {
                console.log('Error:', error);
                setUsers(new Map());
            }
        };
        getUsers();
    }, []);

    useEffect(() => {
        const newUsers = new Map();
        
        data.forEach(user => {
            const username = user.username;
            const existingUser = users.get(username);
            
            if (existingUser) {
                newUsers.set(username, existingUser);
            } else {
                newUsers.set(username, new User(user));
            }
        });
        
        setUsers(newUsers);
    }, [data]);

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
                            style={
                                {
                                    cursor: 'pointer',
                                    backgroundColor: 'lightblue',
                                    marginBottom: '10px',
                                }
                            }
                            onClick={() => {
                                const chatWindow = document.getElementById('chat-window');
                                chatWindow.style.display = 'block';
                                chatWindow.scrollTo(0, chatWindow.scrollHeight);
                            }}
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



export function ChatWindowsContainer() {
    return (
        <div className="chat-windows-container"
        style={{
            position: 'fixed',
            bottom: 0,
            width: 'auto',
            height: '40%',
            opacity: 0.8,
            backgroundColor: 'red',
        }}
        >
            <div className="chat-window" id="chat-window">
                <h2>Chat Window</h2>
                <div className="messages">
                    <div className="message">
                        <p>Message 1</p>
                    </div>
                    <div className="message">
                        <p>Message 2</p>
                    </div>
                </div>
                <div className="input-container">
                    <input type="text" placeholder="Type your message..." />
                    <button>Send</button>
                </div>
            </div>
        </div>
    );
}