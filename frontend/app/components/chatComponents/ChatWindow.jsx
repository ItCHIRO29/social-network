import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import EmojiSelector from './EmojiSelector';
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

const ChatWindow = ({ username, users, myData, socket, onClose, onHide }) => {
  const opponentData = users.get(username)?.userData || {};
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [offset, setOffset] = useState(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const createMessageObject = (message) => ({
    ...message,
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
      const combinedMessages = [...newMessages, ...prev];
      const uniqueMessages = combinedMessages.filter(
        (msg, index, self) => 
          index === self.findIndex((t) => t.id === msg.id)
      );
      return uniqueMessages;
    });
  };

  const appendMessages = (newMessages) => {
    if (!Array.isArray(newMessages)) {
      console.error("Error in appendMessages: messages is not an array");
      return;
    }
    setMessages(prev => {
      const combinedMessages = [...prev, ...newMessages];
      const uniqueMessages = combinedMessages.filter(
        (msg, index, self) => 
          index === self.findIndex((t) => t.id === msg.id)
      );
      return uniqueMessages;
    });
  };

  const fetchMessages = async () => {
    if (isLoadingOlder || !hasMoreMessages) return;
    setIsLoadingOlder(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/get_messages?opponent=${username}&offset=${offset}`,
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
        setHasMoreMessages(false);
      }

      if (data.messages && data.messages.length > 0) {
        prependMessages(data.messages.map(createMessageObject));
        setOffset(data.offset || -1);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const handlePrivateMessage = (event) => {
      const message = event.detail.message;
      addMessage(message);
    };

    document.addEventListener(`privateMessage-${username}`, (event) =>{

      console.log("zzzzzzzzzzzzzzzz")
        handlePrivateMessage(event)
    });

  }, []);

  const addMessage = (message) => {
    const messageObj = createMessageObject(message);
    appendMessages([messageObj]);
    scrollToBottom();
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

    const newMessage = {
      type: 'private message',
      message: messageInput,
      sender: myData.username,
      receiver: username,
      id: Date.now() + Math.random(),
    };

    addMessage(newMessage);
    sendMessage(newMessage);
    setMessageInput('');
  };

  const handleRetry = (uniqueId) => {
    setMessages(prev => {
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
      fetchMessages();
    }
  };

  return (
    <div className="chat-container" style={{ position: 'relative' }}>
      <div className="chat-header">
        <div className="header-left">
          <img
            src={`http://localhost:8080/${opponentData.image}`}
            alt="profile"
            className="profile-pic"
          />
          <div className="header-info">
            <h3>{username}</h3>
            <p>
              {opponentData.online 
                ? "online" 
                : opponentData.last_active 
                  ? `Online ${dateFormat(opponentData.last_active)}` 
                  : "offline"}
            </p>
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
        onScroll={handleScroll}
      >
        {isLoadingOlder && (
          <div className="loading-indicator">Loading older messages...</div>
        )}
        {messages.map((message) => (
          <div key={message.uniqueId}>
            <Message
              message={message}
              myData={myData}
              opponentData={opponentData}
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