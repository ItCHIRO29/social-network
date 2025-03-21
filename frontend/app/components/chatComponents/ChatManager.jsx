// ChatManager.jsx
import { useState, useEffect, useContext } from 'react';
import ChatWindow from './ChatWindow';
import { WebSocketContext } from '../../WebSocketContext';
import styles from './ChatManager.module.css'; // Import the module CSS

const ChatManager = ({ className, id }) => {
  const [chatWindows, setChatWindows] = useState(new Map());
  const [users, setUsers] = useState(new Map());
  const [data, setData] = useState([]);
  const ws = useContext(WebSocketContext);
  const socket = ws?.socket;
  const myData = { username: 'me' }; // Replace with actual user data

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
    console.log("users :: ", users)

    };
    getUsers();
  }, []);

  useEffect(() => {
    const newUsers = new Map();
    data?.forEach(user => {
      newUsers.set(user.username, { userData: user });
    });
    setUsers(newUsers);
  }, [data]);

  const addChatWindow = (username) => {
    setChatWindows(prev => new Map(prev).set(username, {
      username,
      users,
      myData,
      focused: true
    }));
  };

  const deleteChatWindow = (username) => {
    setChatWindows(prev => {
      const newMap = new Map(prev);
      newMap.delete(username);
      return newMap;
    });
  };

  const hideChatWindow = (username) => {
    setChatWindows(prev => {
      const newMap = new Map(prev);
      const chatWindow = newMap.get(username);
      if (chatWindow) {
        newMap.set(username, { ...chatWindow, focused: false });
      }
      return newMap;
    });
  };

  return (
    <div className={`${styles.chatManager} ${className}`} id={id}>
      <h2>Chat</h2>
      {users.size > 0 ? (
        <div className={styles.usersList}>
          {Array.from(users.entries()).map(([username, userObj]) => (
            <div className={styles.usersListItem} key={username}>
              <img className={styles.avatar} src={`http://localhost:8080${userObj.userData.image}`}></img>
              <button
                id="chatButtons"
                className={`${styles.listItem} ${username}`}
                onClick={() => addChatWindow(username)}
              >
                {userObj.userData.firstname} {userObj.userData.lastname}
              </button>
                <div className={`${styles.notify} ${userObj.userData.notify ? styles.active : ''}`} >new message</div>
              <div
                className={`${styles.online} ${userObj.userData.online ? styles.active : ''}`}
              />
            </div>
          
        ))
      }
        </div>
      ) : (
        <button id="chatButtons" className={styles.noChatsButton}>
          No Chats
        </button>
      )}

      <div
        className={styles.chatWindowsContainer}
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
        {Array.from(chatWindows.entries()).map(([username, chatData]) => (
          chatData.focused && (
            <ChatWindow
              key={username}
              username={username}
              userData
              users={chatData.users}
              myData={chatData.myData}
              socket={socket}
              onClose={() => deleteChatWindow(username)}
              onHide={() => hideChatWindow(username)}
            />
          )
        ))}
      </div>
    </div>
  );
};

export { ChatManager };