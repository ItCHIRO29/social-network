import { useState, useEffect, useContext } from 'react';
import ChatWindow from './ChatWindow';
import { WebSocketContext } from '../../WebSocketContext';
import styles from './ChatManager.module.css'; // Import the module CSS

const ChatManager = ({ className, id, userData }) => {
  const [chatWindows, setChatWindows] = useState(new Map());
  const [users, setUsers] = useState(new Map());
  const [data, setData] = useState([]);
  const ws = useContext(WebSocketContext);
  const socket = ws?.socket;
  const myData = userData;

  // Fetch users data on component mount
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
          return;
        }
        const fetchedData = await response.json();
        
        // Create users map directly here
        const newUsersMap = new Map();
        fetchedData.forEach(user => {
          newUsersMap.set(user.username, { userData: user });
        });
        
        // Set both state variables
        setData(fetchedData);
        setUsers(newUsersMap);
        
        console.log("Users fetched:", newUsersMap);
      } catch (error) {
        console.log('Error:', error);
      }
    };
    
    getUsers();
  }, []);

  // Handle status events
  useEffect(() => {
    const handleStatusEvent = (event) => {
      if (event instanceof CustomEvent) {
        const message = event.detail;
        console.log("received status event for", message.username);
        
        // Don't update your own status
        if (message.username === myData.username) return;
        
        // Update user status in the map
        setUsers(prevUsers => {
          // Debug: Check if the map is empty
          if (prevUsers.size === 0) {
            console.log("Warning: Users map is empty when trying to update status");
          }
          
          const user = prevUsers.get(message.username);
          if (!user) {
            console.log("User not found in map:", message.username, "Map size:", prevUsers.size);
            return prevUsers;
          }
          
          // Create new map with updated user status
          const newUsers = new Map(prevUsers);
          newUsers.set(message.username, {
            ...user,
            userData: {
              ...user.userData,
              online: message.online
            }
          });
          
          return newUsers;
        });
      }
    };
    
    document.addEventListener(`status`, handleStatusEvent);
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener(`status`, handleStatusEvent);
    };
  }, [myData.username]);

  const addChatWindow = (username) => {
    console.log("Opening chat with:", username, "Current users map:", users);
    
    setChatWindows(prev => {
      const newMap = new Map(prev);
      newMap.set(username, {
        username,
        users: users, // Pass the current users map snapshot
        myData,
        focused: true
      });
      return newMap;
    });
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
  
  // Ensure we're properly passing updated users to chat windows
  useEffect(() => {
    // When users map changes, update all chat windows with the new users map
    if (users.size > 0) {
      setChatWindows(prev => {
        const updatedWindows = new Map();
        
        for (const [username, chatData] of prev.entries()) {
          updatedWindows.set(username, {
            ...chatData,
            users // Update with the current users map
          });
        }
        
        return updatedWindows;
      });
    }
  }, [users]);
  
  return (
    <div className={`${styles.chatManager} ${className}`} id={id}>
      <h2>Chat</h2>
      {users.size > 0 ? (
        <div className={styles.usersList}>
          {Array.from(users.entries()).map(([username, userObj]) => (
            <div className={styles.usersListItem} key={username}>
              <img className={styles.avatar} src={`http://localhost:8080${userObj?.userData.image.slice(1)}`} alt="User avatar" />
              <button
                id="chatButtons"
                className={`${styles.listItem} ${username}`}
                onClick={() => addChatWindow(username)}
              >
                {userObj.userData.firstname} {userObj.userData.lastname}
              </button>
              <div className={`${styles.notify} ${userObj.userData.notify ? styles.active : ''}`}>new message</div>
              <div
                className={`${styles.onlineIndicator} ${userObj.userData.online ? styles.active : ''}`}
              />
            </div>
          ))}
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
              userData={userData}
              users={users} // Always pass the current users state
              myData={myData}
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