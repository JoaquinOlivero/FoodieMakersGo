import { useEffect, useState } from "react";
import styles from '../styles/Chat.module.scss'
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from 'next/router'
import ChatMenu from "../components/chatPage/chatMenu/ChatMenu";
import ChatMessage from "../components/chatPage/chatMessage/ChatMessage";
import Spinner from "../components/Utils/Spinner"

interface ChatsData {
    "chat_id": string
    "client_id": string
    "client_first_name": string
    "client_last_name": string
    "store_id": string
    "store_name": string
    "latest_message": {
        "sender_id": string
        "content": string
        "is_read": boolean
        "send_time": string
        "unread_messages": number;
    }
}

interface SingleChatData {

}

interface WsMessage {
    "Action": string
    "Content": ChatsData[]
}


// USE router.query when coming from product page

const wsURL = 'wss://api.foodiemakers.xyz/ws'

const Chat = () => {
    const { checkToken, userId } = useAuth()
    const [chatsData, setChatsData] = useState<Array<ChatsData> | null>(null)
    const [menuLoaded, setMenuLoaded] = useState<boolean>(false)
    const [singleChatData, setSingleChatData] = useState(null)
    const [ws, setWs] = useState<WebSocket | null>(null)

    useEffect(() => {

        // check if user is signed in
        checkToken().then((result) => {
            if (result !== "" && result != undefined) return setWs(new WebSocket(wsURL + `?userId=${result}`))
            // router.push('/')
        }).catch((err) => {
            // router.push('/')
        });

    }, [])


    useEffect(() => {
        if (ws) {

            ws.onopen = () => {
                const message = { action: "userChats" }
                ws.send(JSON.stringify(message))
            }

            ws.onmessage = (e) => {
                const message: WsMessage = JSON.parse(e.data);
                switch (message.Action) {
                    case "userChats":
                        setChatsData(message.Content)
                        setMenuLoaded(true)
                        break;

                    case "singleChat":
                        console.log(message.Content)
                    default:
                        break;
                }

            }
        }

        return () => {
            if (ws) {
                ws.onclose = () => {
                    console.log('WebSocket Disconnected');
                }
            }

        }
    }, [ws])


    return (
        <div className={styles.Chat}>
            {userId &&
                <div className={styles.Chat_card}>
                    {menuLoaded && chatsData && ws ?
                        <div className={styles.Chat_container}>
                            <ChatMenu chats={chatsData} userId={userId} ws={ws} />
                            <ChatMessage />
                        </div>
                        :
                        <Spinner size={40} />
                    }

                </div>
            }
        </div>
    )
}

export default Chat