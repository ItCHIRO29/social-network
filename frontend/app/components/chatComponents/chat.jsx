import { useEffect, useRef, useState } from "react";
import "./styles.css"
import styles from './EmojiSelector.module.css';


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

function CreateChatWindow({username}) {
    return (
        <div className="chat-container">
          <div className="chat-header">
            <div className="header-left">
              <img
                src="https://via.placeholder.com/40"
                alt="profile"
                className="profile-pic"
              />
              <div className="header-info">
                <h3>sidi hjaj</h3>
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
              <div className="message-content">
                wsuup
              </div>
            </div>
            <div className="message message-sent">
              <div className="message-content">
                That's the right attitude
              </div>
            </div>
            <div className="message message-received">
              <img
                src="https://via.placeholder.com/28"
                alt="profile"
                className="message-pic"
              />
              <div className="message-content">
                HI
              </div>
            </div>
            <div className="message message-sent">
              <div className="message-content">
                Proud of you brother ❤️
              </div>
            </div>
            <div className="message-status">
              <p>02:000</p>
            </div>
          </div>
    
          <div className="chat-input">
            <input type="text" placeholder="Aa"/>
            <button className="input-icon">😊</button>
            <button className="send-btn"></button>

          </div>
        </div>
      );
}



export function ChatWindowsContainer() {
    return (
      <div className="chat-container chat-windows-container"
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '50%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'flex-end',
          gap: '10px',
          padding: '10px',
          zIndex: 1000,
        //   pointerEvents: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        
            <CreateChatWindow username={"username"}>
            </CreateChatWindow>
        
      </div>
    );
  }


function onEmojiSelect(emoji) {
  const input = document.getElementById('chat-input');
  input.value += emoji;
}


function EmojiSelector({ onEmojiSelect }) {
  const emojiMap = {
    "Smileys & Emotions": [
      "😀", "😊", "😂", "🤣", "😍", "🥰", "😘", "😜",
      "😢", "😭", "😡", "😣", "🥳", "🤓", "😎", "😤"
    ],
    "People & Body": [
      "👋", "👍", "👎", "👊", "✊", "👌", "🙌", "👏",
      "🙏", "💪", "👈", "👉", "👆", "👇", "✌️", "🤘"
    ],
    "Animals & Nature": [
      "🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨",
      "🌸", "🌹", "🌻", "🌴", "🌈", "⭐", "☀️", "🌙"
    ],
    "Food & Drink": [
      "🍎", "🍌", "🍇", "🍉", "🍕", "🍔", "🍟", "🌮",
      "🍣", "🍦", "🍰", "☕", "🍵", "🍺", "🍷", "🥂"
    ],
    "Activities": [
      "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸",
      "🎮", "🎲", "🎯", "🎸", "🎤", "🎧", "🎨", "📷"
    ],
    "Travel & Places": [
      "✈️", "🚗", "🚀", "🚢", "🏍️", "🚲", "🚤", "🏖️",
      "🏕️", "🏠", "🏰", "🗺️", "🗽", "⛰️", "🏝️", "🌋"
    ],
    "Objects": [
      "💡", "📱", "💻", "⌚", "📷", "🎥", "📺", "📻",
      "🔑", "🔒", "🔔", "✂️", "📚", "✏️", "🔍", "💰"
    ],
    "Symbols": [
      "❤️", "💔", "⭐", "✨", "⚡", "💥", "🔥", "💦",
      "✅", "❌", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️"
    ]
  };

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
