import { useState, useEffect, useContext } from 'react';
import ChatWindow from './ChatWindow';
import { WebSocketContext } from '../../WebSocketContext';
import styles from './ChatManager.module.css';
import { FetchData } from '../../utils/getUserData';

const ChatManager = () => {
  const [chatWindows, setChatWindows] = useState(new Map());
  const [users, setUsers] = useState(new Map());
  const [data, setData] = useState([]);
  const ws = useContext(WebSocketContext);
  const socket = ws?.socket;
  const [myData, setMyData] = useState({});

  
      useEffect(() => {
          async function fetchUser() {
              const data = await FetchData("profile", 0);
              setMyData(data);
          }
          fetchUser();
      }, []);

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
        
        // Don't update your own status
        if (message.username === myData.username) return;
        
        // Update user status in the map
        setUsers(prevUsers => {
          const user = prevUsers.get(message.username);
          if (!user) return prevUsers;
          
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
    
    document.addEventListener('status', handleStatusEvent);
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('status', handleStatusEvent);
    };
  }, [myData.username]);

  // Handle private messages
  useEffect(() => {
    const handlePrivateMessage = (event) => {
      if (event instanceof CustomEvent && event.detail && event.detail.message) {
        const message = event.detail.message;
        const senderUsername = message.sender;
        
        // If the sender is not the current user
        if (senderUsername !== myData.username) {
          // Check if we have a chat window open for this sender
          const hasActiveChatWindow = chatWindows.has(senderUsername) && 
                                     chatWindows.get(senderUsername).focused;
          
          // If no active chat window, mark as unread (notify)
          if (!hasActiveChatWindow) {
            setUsers(prevUsers => {
              const user = prevUsers.get(senderUsername);
              if (!user) return prevUsers;
              
              const newUsers = new Map(prevUsers);
              newUsers.set(senderUsername, {
                ...user,
                userData: {
                  ...user.userData,
                  notify: true
                }
              });
              
              return newUsers;
            });
          }
        }
      }
    };
    
    // Add event listeners for private messages
    for (const [username] of users) {
      document.addEventListener(`privateMessage-${username}`, handlePrivateMessage);
    }

    for (const [groupname] of grp)
    
    // Clean up
    return () => {
      for (const [username] of users) {
        document.removeEventListener(`privateMessage-${username}`, handlePrivateMessage);
      }
    };
  }, [users, chatWindows, myData.username]);

  const markMessageAsSeen = async (username) => {
    try {
      await fetch(`http://localhost:8080/api/chat/mark_as_seen?sender=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      // Also update local state
      setUsers(prevUsers => {
        const newUsers = new Map(prevUsers);
        const user = newUsers.get(username);
        if (user) {
          newUsers.set(username, { 
            ...user, 
            userData: { ...user.userData, notify: false } 
          });
        }
        return newUsers;
      });
    } catch (error) {
      console.error('Error marking message as seen:', error);
    }
  };

  const addChatWindow = (username) => {
    // Mark messages as seen when chat window opens
    markMessageAsSeen(username);
    
    setChatWindows(prev => {
      const newMap = new Map(prev);
      newMap.set(username, {
        username,
        users: users,
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
  
  // Update chat windows when users map changes
  useEffect(() => {
    if (users.size > 0) {
      setChatWindows(prev => {
        const updatedWindows = new Map();
        
        for (const [username, chatData] of prev.entries()) {
          updatedWindows.set(username, {
            ...chatData,
            users 
          });
        }
        
        return updatedWindows;
      });
    }
  }, [users]);
  
  return (
    <div className={`${styles.chatManager}`} >
      <h2>Chat</h2>
      {users.size > 0 ? (
        <div className={styles.usersList}>
          {Array.from(users.entries()).map(([username, userObj]) => (
            <div 
              className={styles.usersListItem} 
              id={`usersListItem-${username}`} 
              key={username}
            >
              <img 
                className={styles.avatar} 
                src={`${process.env.NEXT_PUBLIC_API_URL}/${userObj?.userData.image}`} 
                alt="User avatar" 
              />
              <button
                id="chatButtons"
                className={`${styles.listItem} ${username}`}
                onClick={() => addChatWindow(username)}
              >
                {userObj.userData.firstname} {userObj.userData.lastname}
              </button>
              <div className={`${styles.notify} ${userObj.userData.notify ? styles.active : ''}`}>
                new message
              </div>
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
          zIndex: 1000,
        }}
      >
        {Array.from(chatWindows.entries()).map(([username, chatData]) => (
          chatData.focused && (
            <ChatWindow
              key={username}
              username={username}
              userData={chatData.userData}
              users={users}
              setUsers={setUsers}
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