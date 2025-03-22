import { useRouter } from 'next/navigation';

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
            src={`http://localhost:8080${opponentData?.image}`}
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

export default Message;