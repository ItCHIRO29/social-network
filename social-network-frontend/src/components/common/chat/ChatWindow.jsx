import { useState, useRef, useEffect } from 'react';
import { Message, TypingIndicator } from './Message';
import EmojiSelector from './EmojiSelector';
import Image from 'next/image';
import './ChatWindow.css';

function dateFormat(timestamp) {
  if (!timestamp) return 'now';
  if (typeof timestamp === 'string') timestamp = new Date(timestamp);

  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;

  const days = Math.floor(diff / 86400000);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

const ChatWindow = ({ type, chatdata, username, users, setUsers, myData, socket, onClose, onHide }) => {
  const [opponentData, setOpponentData] = useState({});
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [offset, setOffset] = useState(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isAppending, setIsAppending] = useState(true);
  const [members, setMembers] = useState(new Map());

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const respond = await fetch(`http://localhost:8080/api/groups/members?groupId=${chatdata.chatdata.groupedata.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!respond.ok) {
          console.error('Error fetching groups', respond.status);
          return;
        }

        const membersArray = await respond.json();

        const membersMap = new Map();
        membersArray.forEach(user => {
          membersMap.set(user.username, user);
        });

        setMembers(membersMap);
      } catch (error) {
        console.error('Fetch failed:', error);
      }
    };

    if (type === "groupe") fetchMembers();
  }, []);


  // Update opponentData when users Map changes
  useEffect(() => {
    if (users.size > 0) {
      const opponent = users.get(username);
      if (opponent && opponent.userData) {
        setOpponentData(opponent.userData);
      }
    }
  }, [users, username]);

  // Listen for status events specific to this chat window
  useEffect(() => {
    const handleStatusEvent = (event) => {
      if (event instanceof CustomEvent && event.detail.username === username) {
        const message = event.detail;

        setOpponentData(prevData => ({
          ...prevData,
          online: message.online,
          last_active: new Date()
        }));
      }
    };

    document.addEventListener('status', handleStatusEvent);

    return () => {
      document.removeEventListener('status', handleStatusEvent);
    };
  }, [username]);

  const createMessageObject = (message) => ({
    ...message,
    type: type, // Use provided type or fall back to message.type
    status: 'sent',
    timestamp: message.timestamp ? new Date(message.timestamp).getTime() : Date.now(),
    retryCount: message.retryCount || 0,
    uniqueId: `msg-${message.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  });

  const prependMessages = (newMessages) => {
    if (!Array.isArray(newMessages)) {
      console.error("Error in prependMessages: messages is not an array");
      return;
    }
    setMessages(prev => {
      console.log('newMessages 1');
      const combinedMessages = [...newMessages, ...prev];
      const uniqueMessages = combinedMessages.filter(
        (msg, index, self) =>
          index === self.findIndex((t) => t.id === msg.id)
      );
      scrollToBottom();
      return uniqueMessages;
    });
    setIsAppending(false);
  };

  const appendMessages = (newMessages) => {
    if (!Array.isArray(newMessages)) {
      console.error("Error in appendMessages: messages is not an array");
      return;
    }
    setMessages(prev => {
      console.log('newMessages 2');
      const combinedMessages = [...newMessages, ...prev];
      const uniqueMessages = combinedMessages.filter(
        (msg, index, self) =>
          index === self.findIndex((t) => t.id === msg.id)
      );
      scrollToBottom();
      return uniqueMessages;
    });
    setIsAppending(true);

    scrollToBottom();
  };

  const fetchMessages = async (type, chatdata) => {
    console.warn(type, chatdata)
    if (isLoadingOlder || !hasMoreMessages) return;
    setIsLoadingOlder(true);
    let link = "";
    if (type === "User") {
      link = `http://localhost:8080/api/chat/get_messages?opponent=${username}&offset=${offset}`;
    } else if (type === "groupe") {
      link = `http://localhost:8080/api/chat/get_chat_grp?group_id=${chatdata.chatdata.groupedata.id}&offset=${offset}`;
    }
    try {
      const response = await fetch(
        link,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();

      if (!data.messages || data.messages.length < 10 || data.offset === -1) {
        // setHasMoreMessages(false);
      }

      if (data.messages && data.messages.length > 0) {
        prependMessages(data.messages.map(createMessageObject));
        setOffset(data.offset || -1);
        if (isAppending) {
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  // Initial fetch of messages
  useEffect(() => {
    fetchMessages(type, chatdata);
  }, []);

  // Listen for private messages
  useEffect(() => {
    const handlePrivateMessage = (event) => {
      console.warn('detail', event.detail)
      if (event.detail && event.detail.message) {
        if (event.detail.type === 'groupe') {
          addMessage(event.detail);
        } else {
          addMessage(event.detail.message);
          markMessageAsSeen();
        }

        // Mark message as seen since the chat window is active
      }
    };

    const eventListener = (event) => {
      handlePrivateMessage(event);
    };

    document.addEventListener(`privateMessage-${username}`, eventListener);
    document.addEventListener(`groupMessage-${username}`, eventListener);


    return () => {
      document.removeEventListener(`privateMessage-${username}`, eventListener);
      document.addEventListener(`groupMessage-${username}`, eventListener);

    };
  }, [username]);

  const markMessageAsSeen = async () => {
    try {
      await fetch(`http://localhost:8080/api/chat/mark_as_seen?sender=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (error) {
      // console.error('Error marking message as seen:', error);
      return
    }
  };

  const addMessage = (message) => {
    const messageObj = createMessageObject(message);
    appendMessages([messageObj]);
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const sendMessage = (messageObj) => {
    const msgEvent = new CustomEvent("sendMessage", {
      detail: {
        ...messageObj,
        status: 'sent'
      }
    });

    document.dispatchEvent(msgEvent);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    console.log('sender', myData.username);
    const newMessage = {
      type: type === "groupe" ? "groupe" : 'private message',
      message: messageInput,
      sender: myData.username,
      receiver: username,
      groupeId: type === "groupe" ? chatdata.chatdata.groupedata.id : '',
      id: Date.now() + Math.random(),
    };
    console.log('newMessage', newMessage);
    addMessage(newMessage);
    sendMessage(newMessage);
    setMessageInput('');
  };

  const handleRetry = (uniqueId) => {
    setMessages(prev => {
      console.log('newMessages 3');
      const messageToRetry = prev.find(msg => msg.uniqueId === uniqueId);
      if (!messageToRetry) return prev;

      const newMessage = {
        ...messageToRetry,
        uniqueId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        status: 'pending',
        retryCount: (messageToRetry.retryCount || 0) + 1
      };

      const filteredMessages = prev.filter(msg => msg.uniqueId !== uniqueId);
      const updatedMessages = [...filteredMessages, newMessage];

      sendMessage(newMessage);
      return updatedMessages;
    });
    scrollToBottom();
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current.focus();
  };

  const handleScroll = (e) => {
    if (!hasMoreMessages || isLoadingOlder) return;
    const { scrollTop } = e.target;

    if (scrollTop < 50) {
      fetchMessages(type, chatdata);
    }
  };

  useEffect(() => {
    if (isAppending) {
      scrollToBottom();
    }
  }, [messages, isAppending]);

  // Mark messages as seen when component mounts
  useEffect(() => {
    markMessageAsSeen();
  }, []);

  // Check if opponentData is empty
  const hasOpponentData = Object.keys(opponentData).length > 0;
  console.warn("members", members);
  return (
    <div className="chat-container" style={{ position: 'relative' }}>
      <div className="chat-header">
        <div className="header-left">
          {hasOpponentData && (
            <Image
              // src={`${process.env.NEXT_PUBLIC_API_URL}/${opponentData?.image}`}
              src={opponentData.image ?
                `${process.env.NEXT_PUBLIC_API_URL}/${opponentData.image}`
                : '/images/groupIcon.png'}
              alt="profile"
              className="profile-pic"
            />
          )}
          <div className="header-info">
            <h3>{username}</h3>
            {type !== "groupe" && (
              <p>
                {hasOpponentData ? (
                  opponentData.online ? (
                    "online"
                  ) : opponentData.last_active ? (
                    `Online ${dateFormat(opponentData.last_active)}`
                  ) : (
                    "offline"
                  )
                ) : (
                  "Loading status..."
                )}
              </p>
            )}
          </div>

        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={onHide}>—</button>
          <button className="icon-btn" onClick={onClose}>❌</button>
        </div>
      </div>

      <div
        className="chat-messages"
        ref={messagesContainerRef}
      // onScroll={handleScroll}
      >
        {isLoadingOlder && (
          <div className="loading-indicator">Loading older messages...</div>
        )}

        {[...messages].reverse().map((message) => (
          // {/* {messages.map((message) => ( */}
          <div key={message.uniqueId}>
            <Message
              message={message}
              myData={myData}
              opponentData={hasOpponentData ? opponentData : members.get(message.sender)}
            />
            {message.status === 'failed' && (
              <div className="message-error">
                <span>Failed to send</span>
                <button
                  onClick={() => handleRetry(message.uniqueId)}
                  className="retry-btn"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', gap: '8px' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Aa"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="chat-input-field"
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
        <div
          className="emoji-picker-container"
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '10px',
            zIndex: 1001,
          }}
        >
          <EmojiSelector onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;