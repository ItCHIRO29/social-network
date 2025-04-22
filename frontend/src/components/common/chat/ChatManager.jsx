import { useState, useEffect, useContext, use } from 'react';
import ChatWindow from './ChatWindow';
import styles from './ChatManager.module.css';
import { WebSocketContext } from '../providers/websocketContext';
import { useUserData } from "../providers/userDataContext";
import { type } from 'os';

const ChatManager = () => {
  const [chatWindows, setChatWindows] = useState(new Map());
  const [users, setUsers] = useState(new Map());
  const [grps, setGrps] = useState(new Map());
  const [data, setData] = useState([]);
  const ws = useContext(WebSocketContext);
  const socket = ws?.socket;
  const myData = useUserData();
  // console.warn("mydata", myData);
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
        // console.log("fetchedData for messages:", fetchedData);
        // Create users map directly here
        const newUsersMap = new Map();
        fetchedData.forEach(user => {
          newUsersMap.set(user.username, {
            userData: user,
            type: "User"
          });
        });
        setData(fetchedData);
        setUsers(newUsersMap);
      } catch (error) {
        console.log('Error:', error);
      }
    };

    const getgrps = async () => {
      try {
        const resp = await fetch('http://localhost:8080/api/groups/getGroups/GroupsMember', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!resp.ok) {
          console.log('Error fetching grps:', resp.status, resp.statusText);
          return;
        }

        // First check what the response actually contains
        const responseText = await resp.text();
        console.log('Raw response:', responseText);

        // Only try to parse if there's content
        if (!responseText) {
          console.log('Empty response from server');
          return;
        }

        const groups = JSON.parse(responseText);

        const newgrps = new Map();
        groups.forEach(grp => {
          newgrps.set(grp.name, {
            groupedata: grp,
            type: "groupe",
          });
        });

        setGrps(newgrps);
        console.log(newgrps);
      } catch (error) {
        console.error('Error in getgrps:', error);
      }
    }
    getgrps();
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
              let user = prevUsers.get(senderUsername);
              if (!user) {
                console.warn(event.detail.message.senderData);
                user = {
                  userData: {
                    firstname: event.detail.message.senderData.first_name,
                    lastname: event.detail.message.senderData.last_name,
                    image: event.detail.message.senderData.image,
                    username: event.detail.message.senderData.username,
                    type: "public",
                  },
                };
              };

              const updatedUser = {
                ...user,
                userData: {
                  ...user.userData,
                  notify: true
                }
              };

              const newUsers = new Map();

              // First, insert the updated user at the top
              newUsers.set(senderUsername, updatedUser);

              // Then add the rest, skipping the updated one
              for (const [username, userObj] of prevUsers.entries()) {
                if (username !== senderUsername) {
                  newUsers.set(username, userObj);
                }
              }

              // console.log("Reordered users map:", Array.from(newUsers.entries()));
              return newUsers;
            });

          }
        }
      }
    };

    const Sortusers = (event) => {
      setUsers(prevUsers => {
        const user = prevUsers.get(event.detail.receiver);
        if (!user) {
          return prevUsers;
        }

        const newUsers = new Map();

        newUsers.set(event.detail.receiver, user);

        for (const [username, userObj] of prevUsers.entries()) {
          if (username !== event.detail.receiver) {
            newUsers.set(username, userObj);
          }
        }

        return newUsers;
        ;
      })
    }

    // Add event listeners for private messages
    // for (const [username] of users) {
    document.addEventListener(`privateMessage`, handlePrivateMessage);
    // }

    document.addEventListener("sendMessage", Sortusers)

    // Clean up
    return () => {
      for (const [username] of users) {
        document.removeEventListener(`privateMessage-${username}`, handlePrivateMessage);
      }
      document.removeEventListener("sendMessage", Sortusers)

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

  const addChatWindow = (username, type, chatdata) => {
    // Mark messages as seen when chat window opens
    markMessageAsSeen(username);

    setChatWindows(prev => {
      const newMap = new Map(prev);
      newMap.set(username, {
        username,
        users: users,
        myData,
        focused: true,
        type: type,
        chatdata: chatdata,
      });
      console.log('New chat window:', newMap);
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
    <div className={styles.chatManager}>
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
                src={userObj?.userData?.image
                  ? `${process.env.NEXT_PUBLIC_API_URL}/${userObj.userData.image}`
                  : '/images/profile.png'}
                alt="User avatar"
                width={40}
                height={40}
              />
              <button
                id="chatButtons"
                className={`${styles.listItem} ${username}`}
                onClick={() => addChatWindow(username, userObj.type, userObj)}
              >
                {userObj.userData.firstname} {userObj.userData.lastname}
              </button>
              <div className={`${styles.notify} ${userObj.userData.notify ? styles.active : ''}`}>
                New
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
      <h2>Group Chat</h2>
      {grps.size > 0 ? (
        <div className={styles.usersList}>
          {Array.from(grps.entries()).map(([grpname, grpobject]) => (
            <div
              className={styles.usersListItem}
              id={`usersListItem-${grpname}`}
              key={grpname}
            >
              <img
                width={40}
                height={40}
                className={styles.avatar}
                ///home/iichi/social-network/social-network-frontend/public/images/groupIcon.jpg
                src={`/images/groupIcon.jpg`}
                alt="User avatar"
              />
              <div key={grpname}>
                <button
                  id="chatButtons"
                  className={`${styles.listItem} ${grpname}`}
                  onClick={() => addChatWindow(grpname, grpobject.type, grpobject)}
                >{grpname}</button>
                <div>
                  {grpobject.groupedata.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <button id="chatButtons" className={styles.noChatsButton}>
          No Chats
        </button>
      )
      }
      {/* Chat windows container - positioned relative to the sidebar */}
      <div className={styles.chatWindowsContainer}>
        {Array.from(chatWindows.entries()).map(([username, chatData]) => (
          chatData.focused && (
            <ChatWindow
              type={chatData.type}
              chatdata={chatData}
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