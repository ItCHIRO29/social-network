import { useContext, useEffect, useRef, useState } from "react";
import "./styles.css"
import styles from './EmojiSelector.module.css';
import {emojiMap} from './emojiMap.js';
import { WebSocketContext } from "../../WebSocketContext.tsx";


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
                <div className="users-list">
                    {Array.from(users.entries()).map(([username, userObj]) => (
                        <button
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
                        </button>
                    ))}
                </div>
            ) : (
                <button>No Chats</button>
            )}
        </div>
    );
}




// export function ChatWindowsContainer() {
//     return (
//       <div className="chat-container chat-windows-container"
//         style={{
//           position: 'fixed',
//           bottom: 0,
//           left: '50%',
//           transform: 'translateX(-50%)',
//           width: '100%',
//           height: '50%',
//           display: 'flex',
//           flexDirection: 'row',
//           justifyContent: 'flex-start',
//           alignItems: 'flex-end',
//           gap: '10px',
//           padding: '10px',
//           zIndex: 1000,
//         //   pointerEvents: 'none',
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         }}
//       >
        
//             <CreateChatWindow username={"username"}>
//             </CreateChatWindow>
//             <EmojiSelector onEmojiSelect={onEmojiSelect} />
        
//       </div>
//     );
//   }


  function CreateChatWindow({ username }) {
    const ws = useContext(WebSocketContext);
    const socket = ws?.socket;

    setTimeout(() => {
    socket?.send(JSON.stringify({
      type: 'chat',
      data: {
        message: 'Hello from the client!',
        sender: 'Client',
        timestamp: new Date().toISOString(),
      },
    }));
  },  2000);
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef(null);
  
    const handleEmojiSelect = (emoji) => {
      setMessage(prev => prev + emoji);
      setShowEmojiPicker(false); 
      inputRef.current.focus(); 
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (message.trim()) {
        console.log("Sending:", message);
        setMessage("");
      }
    };
  
    return (
      <div className="chat-container" style={{ position: 'relative' }}>
        <div className="chat-header">
          <div className="header-left">
            <img
              src="https://via.placeholder.com/40"
              alt="profile"
              className="profile-pic"
            />
            <div className="header-info">
              <h3>{username || "sidi hjaj"}</h3>
              <p>online</p>
            </div>
          </div>
          <div className="header-right">
            <button className="icon-btn">❌</button>
          </div>
        </div>
  
        <div className="chat-messages">
          <div className="message message-received">
            <img
              src="https://via.placeholder.com/28"
              alt="profile"
              className="message-pic"
            />
            <div className="message-content">wsuup</div>
          </div>
          <div className="message message-sent">
            <div className="message-content">That's the right attitude</div>
          </div>
          <div className="message message-received">
            <img
              src="https://via.placeholder.com/28"
              alt="profile"
              className="message-pic"
            />
            <div className="message-content">HI</div>
          </div>
          <div className="message message-sent">
            <div className="message-content">Proud of you brother ❤️</div>
          </div>
          <div className="message-status">
            <p>02:00</p>
          </div>
        </div>
  
        <div className="chat-input">
          <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Aa"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="input-icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>
            <button type="submit" className="send-btn"></button>
          </form>
        </div>
  
        {showEmojiPicker && (
          <div style={{
            position: 'absolute',
            bottom: '60px', 
            right: '10px',
            zIndex: 1001,
          }}>
            <EmojiSelector onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
      </div>
    );
  }
  
  // Update your ChatWindowsContainer to use the modified CreateChatWindow
  export function ChatWindowsContainer() {
    return (
      <div
        className="chat-container chat-windows-container"
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'auto',
          height: 'auto',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'flex-end',
          gap: '10px',
          padding: '10px 10px 0px 10px',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <CreateChatWindow username="username" />
        <CreateChatWindow username="username" />
        <CreateChatWindow username="username" />
        <CreateChatWindow username="username" />
      </div>
    );
  }
  
  // Keep your EmojiSelector as is, but here's it for completeness
  function EmojiSelector({ onEmojiSelect }) {
    
  
    return (
      <div className={styles.emojiSelector}>
        {Object.entries(emojiMap).map(([category, emojis]) => (
          <div key={category} className={styles.emojiCategory}>
            <h3>{category}</h3>
            <div className={styles.emojiGrid}>
              {emojis.map((emoji) => (
                <button key={emoji} onClick={() => onEmojiSelect(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }