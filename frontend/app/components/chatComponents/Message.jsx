import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const Message = ({ message, myData, opponentData }) => {
  const router = useRouter();
  const isSent = message.sender === myData.username;

  const handleImageClick = () => {
    router.push(`/profile?id=${isSent ? message.sender_id : message.receiver_id}`);
  };

  return (
    <div className={`message ${isSent ? 'message-sent' : 'message-received'}`}>
      {!isSent && (
        <div className="message-pic">
          <img
            src={`http://localhost:8080${opponentData?.image.slice(1)}`}
            alt="Profile Picture"
            onClick={handleImageClick}
            className='profile-pic'
            style={{ cursor: 'pointer' }}
          />
        </div>
      )}
      <div className="message-content">
        {message.message || message.content}
        {message.status === 'pending' && (
          <span className="message-status">Sending...</span>
        )}
      </div>
    </div>
  );
};


const TypingIndicator = ({ opponentData }) => {
  const router = useRouter();
  const typingIndicatorRef = useRef(null);
  const handleImageClick = () => {
    if (opponentData && opponentData.id) {
      router.push(`/profile?id=${opponentData.id}`);
    }
  };

  useEffect(() => {
    document.addEventListener(`typing-${opponentData.username},`, (event) => {
      typingIndicatorRef.current.classList.toggle('active', event.detail.isTyping);
    });
  }, []);

  return (
    <div className={["message", "message-received", "typing-indicator"].join(' ')} ref = {typingIndicatorRef}>
      {opponentData && (
        <div className="message-pic">
          <img
            src={`http://localhost:8080${opponentData?.image.slice(1)}`}
            alt="Profile Picture"
            onClick={handleImageClick}
            className='profile-pic'
            style={{ cursor: 'pointer' }}
          />
        </div>
      )}
      <div className="message-content">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 10" width="40" height="16" preserveAspectRatio="xMidYMid meet">
          <circle cx="8" cy="5" r="3" fill="#999999">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0s" />
            <animate attributeName="cy" values="6.5;3.5;6.5" dur="1.5s" repeatCount="indefinite" begin="0s" />
          </circle>
          
          <circle cx="20" cy="5" r="3" fill="#999999">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="cy" values="6.5;3.5;6.5" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
          </circle>
          
          <circle cx="32" cy="5" r="3" fill="#999999">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
            <animate attributeName="cy" values="6.5;3.5;6.5" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
          </circle>
        </svg>
      </div>
    </div>
  );
};
export { Message, TypingIndicator };