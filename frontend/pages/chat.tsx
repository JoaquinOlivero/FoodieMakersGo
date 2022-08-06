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
        messages_not_read: number;
    }
}


// USE router.query when coming from product page

const Chat = () => {
    const { checkToken, userId } = useAuth()
    const router = useRouter()
    const [chatsData, setChatsData] = useState<Array<ChatsData> | null>(null)
    const [menuLoaded, setMenuLoaded] = useState<boolean>(false)

    const chats = async () => {
        const res = await fetch('https://api.foodiemakers.xyz/chat/all', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        const data = await res.json()

        if (res.status === 200) {
            setChatsData(data.chats)
            setMenuLoaded(true)

        }
        return
    }

    useEffect(() => {

        // check if user is signed in
        checkToken().then((result) => {
            if (result === 200) return chats()
            // router.push('/')
        }).catch((err) => {
            // router.push('/')
        });

    }, [])

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