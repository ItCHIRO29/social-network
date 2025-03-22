import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import EmojiSelector from './EmojiSelector';
import './ChatWindow.css';

const ChatWindow = ({ username, users, myData, socket, onClose, onHide }) => {
  const opponentData = users.get(username)?.userData || {};
  const [messages, setMessages] = useState(new Map());
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const createMessageObject = (message) => ({
    ...message,
    status: message.status || 'pending',
    timestamp: message.timestamp ? new Date(message.timestamp).getTime() : Date.now(),
    retryCount: message.retryCount || 0
  });

  const fetchMessages = async () => {
    if (isLoadingOlder || offset === -1) return;
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
      if (!response.ok) return;

      const data = await response.json();
      setOffset(data?.offset);

      if (data.messages && data.messages.length > 0) {
        setMessages(prev => {
          const newMap = new Map(prev);
          const previousHeight = messagesContainerRef.current.scrollHeight;
          const previousScrollTop = messagesContainerRef.current.scrollTop;

          // Prepend older messages
          data.messages
            // .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .forEach(msg => {
              newMap.set(msg.id, createMessageObject({ ...msg, status: 'sent' }));
            });

          // Maintain scroll position when loading older messages
          if (offset > 0) {
            requestAnimationFrame(() => {
              const newHeight = messagesContainerRef.current.scrollHeight;
              messagesContainerRef.current.scrollTop = newHeight - previousHeight + previousScrollTop;
            });
          } else {
            // Initial load - scroll to bottom
            requestAnimationFrame(() => scrollToBottom());
          }

          return newMap;
        });
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'private message') {
        addMessage({ ...data, status: 'sent' });
      } else if (data.type === 'receiveError') {
        handleMessageError(data.messageId);
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, [socket]);

  const addMessage = (message) => {
    const messageObj = createMessageObject({
      ...message,
      id: message.id || Date.now() + Math.random(),
    });

    setMessages(prev => {
      const newMap = new Map(prev);
      newMap.set(messageObj.id, messageObj);
      return newMap;
    });
    scrollToBottom();
  };

  const handleMessageError = (messageId) => {
    setMessages(prev => {
      const newMap = new Map(prev);
      const message = newMap.get(messageId);
      if (message) {
        newMap.set(messageId, { ...message, status: 'failed' });
      }
      return newMap;
    });
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const sendMessage = (messageObj) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(messageObj));
      setMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(messageObj.id, { ...messageObj, status: 'sent' });
        return newMap;
      });
    } else {
      setMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(messageObj.id, { ...messageObj, status: 'failed' });
        return newMap;
      });
      socket.dispatchEvent(new CustomEvent('receiveError', { 
        detail: { messageId: messageObj.id }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket) return;

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

  const handleRetry = (messageId) => {
    setMessages(prev => {
      const newMap = new Map(prev);
      const oldMessage = newMap.get(messageId);
      if (!oldMessage) return prev;

      const newMessage = {
        ...oldMessage,
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        status: 'pending',
        retryCount: (oldMessage.retryCount || 0) + 1
      };
      
      newMap.delete(messageId);
      newMap.set(newMessage.id, newMessage);
      sendMessage(newMessage);
      return newMap;
    });
    scrollToBottom();
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current.focus();
  };

  const handleScroll = (e) => {
    if (offset === -1 || isLoadingOlder) return;
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
            <p>{opponentData.online ? "online" : opponentData.last_active ? `active since ${opponentData.last_active}` : "offline"}</p>
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
        {Array.from(messages.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .map(([id, message]) => (
            <div key={`wrapper-${id}`}>
              <Message
                message={message}
                myData={myData}
                opponentData={opponentData}
              />
              {message.status === 'failed' && (
                <div className="message-error">
                  <span>Failed to send</span>
                  <button 
                    onClick={() => handleRetry(id)}
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
          <button type="submit" className="send-btn">
            {/* Send icon or text could go here */}
          </button>
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