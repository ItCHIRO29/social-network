import { getChat } from "../helpers/fetchChat"
import { useEffect, useState } from "react";
import "../profile/profile.css"
// import "../home/home.css"


export default function chat({ className, id }) {
    const [chaters, setChaters] = useState([]);
    useEffect(() => {
        const fetchChat = async () => {
            const chat = await getChat();
            setChaters(chat);
        }
        fetchChat();
        console.log("chaters1 ===> ", chaters);
    }, [])
    console.log("chaters2 ===> ", chaters);
    // `http://localhost:8080/{chater.Image}`
    return (
        <>
            <div className={className} id={id} >
                <h2>Chat</h2>
                {chaters ?
                    chaters.map((chater) => (
                        <button key={chater.id}>{chater.user2_name}</button>
                    )) :
                    <button>No Chats</button>
                }
            </div>
        </>
    )
} 