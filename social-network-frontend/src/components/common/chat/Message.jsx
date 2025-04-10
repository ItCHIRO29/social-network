import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const Message = ({ message, myData, opponentData }) => {
  const router = useRouter();
  console.log("message MyData ======>", myData);
  // console.log("message opponentData ======>", opponentData);
  // console.log("message message ======>", message);
  const isSent = message.sender === myData.username;
  const Mymessages = message.sender !== opponentData.username
  const handleImageClick = () => {
    router.push(`/profile?id=${isSent ? message.sender_id : message.receiver_id}`);
  };
  let urlImage = '';
  if (Mymessages) {
    urlImage = `${process.env.NEXT_PUBLIC_API_URL}/${myData?.userData.image}`;
  } else {
    urlImage = `${process.env.NEXT_PUBLIC_API_URL}/${opponentData?.image}`;
  }
  return (
    <div className={`message ${Mymessages ? 'message-sent' : 'message-received'}`}>
      {!isSent && (
        <div className="message-pic">
          <img
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