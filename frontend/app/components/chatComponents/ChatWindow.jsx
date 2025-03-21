// ChatWindow.jsx
import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import EmojiSelector from './EmojiSelector';
import './ChatWindow.css'; 

const ChatWindow = ({ username, users, myData, socket, onClose, onHide }) => {
  const opponentData = users.get(username)?.userData || {};
  const [messages, setMessages] = useState(new Map());
  const [offset, setOffset] = useState(0);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [sentMaxId, setSentMaxId] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(null);

    document.addEventListener('privateMessage', (event) => {
        const message = event.detail;
        addMessage(message);
    });


  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/get_messages?opponent=${username}&offset=${offset}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        console.log('Error fetching chat data');
        return;
      }
      const data = await response.json();
      setOffset(data?.offset);
      if (data.offset === -1) {
          return;
      }
      for (const message of data?.messages) {
        addMessage(message, myData, opponentData);
      }
    } catch (error) {
      console.log('Error:', error);
    }
      
}


    useEffect(() => {
      fetchMessages();
    }, []);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          addMessage({
            ...data.data,
            id: data.data.id || Date.now()
          });
        }
      };
    }
  }, [socket]);

  const addMessage = (message) => {
    setMessages(prev => {
      const newMap = new Map(prev);
      newMap.set(message.id, message);
      setLastMessageTime(message.timestamp);
      return newMap;
    });
    scrollToBottom();
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageInput.trim() && socket) {
      const newMessage = {
        type: 'private message',
          message: messageInput,
          sender : myData.username,
          receiver: username,

          id: sentMaxId
      };

      const sendMessageEvent = new CustomEvent('sendMessage', { detail: newMessage });

      addMessage(newMessage);
      document.dispatchEvent(sendMessageEvent);
      setSentMaxId(prev => prev + 1);
      setMessageInput('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current.focus();
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
            <p>{opponentData.online ? "online" : opponentData.last_active ? `active scince ${opponentData.last_active}` : "offline"}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={onHide}>—</button>
          <button className="icon-btn" onClick={onClose}>❌</button>
        </div>
      </div>

      <div className="chat-messages" ref={messagesContainerRef} onScroll={(e)=>{
          if (offset === -1)  return;
            console.log("scrollEvent");
            const { scrollTop, scrollHeight, clientHeight } = e.target;
        
            if (scrollTop === 0) {
              fetchMessages();
              e.target.scrollTop = 1;
            }
      }}>
        {Array.from(messages.values()).map((message) => (
            <div key={`wrrapper-${message.id}`}>
            {new Date(message.timestamp) - lastMessageTime > 10000 ??  <p>{new Date().toLocaleString()}</p>}
          <Message
            key={message.id}
            message={message}
            myData={myData}
            opponentData={opponentData}
          />
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
            className="chat-input-field" // Added class for specific styling if needed
          />
          <button
            type="button"
            className="input-icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>
          <button type="submit" className="send-btn">
            {/* You can add text or leave it as is for the icon */}
          </button>
        </form>
      </div>

      {showEmojiPicker && (
        <div className="emoji-picker-container" style={{
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
};

export default ChatWindow;