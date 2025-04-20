import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
const Message = ({ message, myData, opponentData }) => {
  const router = useRouter();
  const isSent = message.sender === myData.username;
  let Mymessages
  if (opponentData) {
    Mymessages = message.sender !== opponentData.username;
  }
  if (message.type === "groupe") {
    Mymessages = message.sender === myData.userData.username
  }
  const handleImageClick = () => {
    router.push(`/profile/${message.sender}`);
    return
  };
  let urlImage = '';
  if (Mymessages) {
    urlImage = myData.userData?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${myData?.userData.image}` : `/images/default-avatar.svg`;
  } else {
    urlImage = opponentData?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${opponentData?.image}` : `/images/default-avatar.svg`;
  }
  return (
    <div className={`message ${Mymessages ? 'message-sent' : 'message-received'}`}>
      {!Mymessages && (
        <div className="message-pic">
          <img
            width={50}
            height={50}
            src={urlImage}
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


export { Message };