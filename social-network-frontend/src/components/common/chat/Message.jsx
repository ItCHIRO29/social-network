import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
const Message = ({ message, myData, opponentData }) => {
  // console.log("this", opponentData.get(message.sender).username);
  console.warn("mydata", opponentData)
  console.log("data message fetshed:", message, myData.userData.username)
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
    // router.push(`/profile?id=${!Mymessages ? message.sender_id : message.receiver_id}`);
    router.push(`/profile/${message.sender}`);
    return
  };
  let urlImage = '';
  if (Mymessages) {
    urlImage = `${process.env.NEXT_PUBLIC_API_URL}/${myData?.userData.image}`;
  } else {
    urlImage = `${process.env.NEXT_PUBLIC_API_URL}/${opponentData?.image}`;
  }
  return (
    <div className={`message ${Mymessages ? 'message-sent' : 'message-received'}`}>
      {!Mymessages && (
        <div className="message-pic">
          <Image 
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