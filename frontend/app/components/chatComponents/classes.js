// class Chat {
//   constructor() {
//     this.chatWindows = new Map(); // key: username, value: ChatWindow
//   }

//   addChatWindow(username, users, myData) {
//     const chatWindow = new ChatWindow(username, users, myData);
//     this.chatWindows.set(username, chatWindow);
//   }

//   deleteChatWindow(username) {
//     this.chatWindows.delete(username);
//   }

//   getChatWindow(username) {
//     return this.chatWindows.get(username);
//   }


//   hideChatWindow(username) {
//     const chatWindow = this.getChatWindow(username);
//     if (chatWindow.comomponent) { {
//       chatWindow.comomponent.hide();
//       chatWindow.focused = false;
//     }
//   }
// }

//   showChatWindow(username) {
//     const chatWindow = this.getChatWindow(username);
//     if (chatWindow) {
//       chatWindow.show();
//       chatWindow.focused = true;
//       return
//     }
//     this.addChatWindow(username);
//   }

// }


// class chatWindow {
//   constructor(username, users, myData) {
//     this.opponentData = users.get(username);
//     this.myData = myData;
//     this.component = null;
//     this.focused = true;
//     this.input = null;
//     this.messagesContainer = null;
//     this.messages = new Map(); // key: messageId, value: Message
//     this.typingIndicatorComponent = null;
//     this.statusIndicatorComponent = null;
//     this.sentMaxId = 0;
//     this.lastMessageTimestamp = null;
// }

//   addMessage(message) {
//     this.messages.set(message.id, message);
//     this.messagesContainer.appendChild(message.component);
//     this.lastMessageTimestamp = message.timestamp;
//     this.scrollToBottom();
//   }

//   scrollToBottom() {
//     this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
//   }

//   renderChatWindow() {
//     return (
//       <div className="chat-window">
//         <div className="chat-header">
//           <div className="chat-pic">
//             <img src={this.opponentData.profilePic} alt="Profile Picture" />
//           </div>
//           <div className="chat-name">{this.opponentData.username}</div>
//         </div>
//         <div className="messages" ref={(el) => (this.messagesContainer = el)}>
//           {Array.from(this.messages.values()).map((message) => message.component)}
//         </div>
//         <div className="chat-input">
//           <input type="text" placeholder="Type a message" ref={(el) => (this.input = el)} />
//           <button type="submit">Send</button>
//         </div>
//       </div>
//     );
//   }
// }


// class Message {
//   constructor(message, myData) {
//     this.message = message.content;
//     this.sender = message.sender;
//     this.timestamp = message.timestamp;
//     this.sentMaxId = this.generateId(myData);
//     this.component = null;
//   }

//   generateId(myData) {
//     const isSent = this.message.sender === myData.username ? true : false;
//     this.id = isSent ? this.chatWindow.sentMaxId++ : this.message.id;
//     this.chatWindow.sentMaxId++;
//   }

//   createMessageComponent() {
//     return (
//         <div className={`message ${this.message.sender === this.myData.username ? 'message-sent' : 'message-received'}`}>
//              {this.message.sender === this.myData.username ??
//             <div className="message-pic">
//                  <img src={this?.opponentData?.profilePic} alt="Profile Picture" />
//             </div>}
//             <div className="message-content">{this.message.content}</div>
//         </div>
//     )

//     imageOnclick() {
//         const router = useRouter();
//         router.push(`/profile?id=${this.message.sender}`);
//     }
    

//   }

//   error(type) {
//     if (type === 'bad-message') {
//         this.component.classList.add('error');
//         this.component.textContent = 'Invalid message format: (MAX_LENGTH: 1000,  MIN_LENGTH: 1';
//         const retry = document.createElement('button');
//         retry.textContent = 'Retry';
//         retry.addEventListener('click', () => {
//             try {
//                 await this.sendMessage(message);
//             }
//         });
//         this.component.appendChild(retry);

//     } else if (type === 'network') {
//         this.component.classList.add('error');
//         this.component.textContent = 'Network error or you are rate limited, please try again in a few seconds(if the error persists, logout and login again)';
//   }



  
// }