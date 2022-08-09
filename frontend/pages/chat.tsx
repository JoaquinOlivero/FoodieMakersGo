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


// USE router.query when coming from product page

const wsURL = 'wss://api.foodiemakers.xyz/ws'

const Chat = () => {
    const { checkToken, userId } = useAuth()
    const router = useRouter()
    const [chatsData, setChatsData] = useState<Array<ChatsData> | null>(null)
    const [menuLoaded, setMenuLoaded] = useState<boolean>(false)
    const [ws, setWs] = useState<WebSocket | null>(null)

    const chats = async () => {
        // const res = await fetch('https://api.foodiemakers.xyz/chat/all', {
        //     method: 'GET',
        //     credentials: 'include',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     },
        // })
        // const data = await res.json()

        // if (res.status === 200) {
        //     setChatsData(data.chats)
        //     setMenuLoaded(true)

        // }
        if (ws) {
            const message = { action: "userChats" }
            ws.send(JSON.stringify(message))
        }

        return
    }

    useEffect(() => {

        // check if user is signed in
        checkToken().then((result) => {
            // if (result === 200) return chats()
            if (result !== "") return setWs(new WebSocket(wsURL + `?userId=${result}`))
            // router.push('/')
        }).catch((err) => {
            // router.push('/')
        });

    }, [])


    useEffect(() => {
        if (ws) {

            ws.onopen = () => {
                console.log('WebSocket Connected');
                chats()
            }

            ws.onmessage = (e) => {
                const message = JSON.parse(e.data);
                console.log(message);
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
                    {menuLoaded && chatsData ?
                        <div className={styles.Chat_container}>
                            <ChatMenu chats={chatsData} userId={userId} />
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