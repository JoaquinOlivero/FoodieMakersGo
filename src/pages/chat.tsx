import { useEffect, useState } from "react";
import styles from '../styles/Chat.module.scss'
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from 'next/router'
import ChatMenu from "../components/chatPage/chatMenu/ChatMenu";
import ChatMessage from "../components/chatPage/chatMessage/ChatMessage";
import Spinner from "../components/Utils/Spinner"
import HomeSvg from "../components/Utils/svg/HomeSvg"
import Link from 'next/link'

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
    "chat_id": string
    "client_id": string
    "client_first_name": string
    "client_last_name": string
    "store_id": string
    "store_name": string
    "messages": [{
        "created_at": string
        "is_read": boolean
        "message": string
        "sender_id": string
    }]
}

interface WsMessage {
    Action: string
    Content: ChatsData[] | SingleChatData
}


// USE router.query when coming from product page

const wsURL = 'wss://apifm.joaquinolivero.com/ws' // Change this to an env variable

const Chat = () => {
    const { checkToken, userId } = useAuth()
    const router = useRouter()
    const { chat_id } = router.query
    const [chatsData, setChatsData] = useState<Array<ChatsData> | null>(null)
    const [menuLoaded, setMenuLoaded] = useState<boolean>(false)
    const [singleChatData, setSingleChatData] = useState<SingleChatData | null>(null)
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

    // WEBSOCKET CONNECTION
    useEffect(() => {
        window.history.replaceState(null, '', '/chat')
        if (userId) return setWs(new WebSocket(wsURL + `?userId=${userId}`))

        // check if user is signed in and establish a websocket connection
        checkToken().then((result) => {
            if (result !== "" && result != undefined && result != 400) return setWs(new WebSocket(wsURL + `?userId=${result}`))
            router.push('/')
        }).catch((err) => {
            router.push('/')
        });



    }, [])

    useEffect(() => {
        if (ws) {

            ws.onopen = () => {
                const message = { action: "userChats" }
                ws.send(JSON.stringify(message))
                if (chat_id) {
                    const message = { action: "singleChat", chat_id: chat_id }
                    ws.send(JSON.stringify(message))
                    setSelectedChatId(chat_id as string)
                }
            }

            ws.onmessage = (e) => {
                const message: WsMessage = JSON.parse(e.data);
                switch (message.Action) {
                    case "userChats":
                        setChatsData(message.Content as ChatsData[])
                        setMenuLoaded(true)
                        break;

                    case "singleChat":
                        setSingleChatData(message.Content as SingleChatData)
                        break;

                    case "newMessage":
                        const newMessageArr = [...singleChatData!.messages, message.Content]

                        // update the messages array inside singleChatData state.
                        if (singleChatData) {
                            setSingleChatData((prevState: any) => ({
                                ...prevState, ["messages"]: newMessageArr
                            }));
                        }
                        break;
                    default:
                        break;
                }

            }
        }

    }, [ws, singleChatData])

    useEffect(() => {
        return () => {
            if (ws) {
                ws.onclose = () => {
                    // console.log('WebSocket Disconnected');
                }
                ws.close()
            }

        }
    }, [ws])

    return (
        <div className={styles.Chat}>
            {userId &&
                <div className={styles.Chat_card}>
                    <Link href="/">
                        <div className={styles.Chat_home_btn}>
                            <HomeSvg />
                        </div>
                    </Link>
                    {menuLoaded && chatsData && ws ?
                        <div className={styles.Chat_container}>
                            <ChatMenu chats={chatsData} userId={userId} ws={ws} selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} />
                            {singleChatData && <ChatMessage singleChatData={singleChatData} setSingleChatData={setSingleChatData} userId={userId} ws={ws} selectedChatId={selectedChatId} />}
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