import { useEffect, useRef, useState } from 'react'
import styles from '../../../styles/components/chatPage/chatMessage/ChatMessage.module.scss'
import ReplySvg from '../../Utils/svg/ReplySvg'

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
interface NewMessageData {
    "is_read": boolean
    "message": string
    "sender_id": string
}

interface WsMessage {
    Action: string
    Content: NewMessageData
}

type props = {
    singleChatData: SingleChatData
    userId: string;
    ws: WebSocket
    setSingleChatData: Function
}

const currentUserMessageStyle = {
    backgroundColor: "#fd2922c4",
    color: "white",
    alignSelf: "flex-end"
}

const otherUserMessageStyle = {
    backgroundColor: "#F3F3F5"
}

const ChatMessage = (props: props) => {
    const { singleChatData, userId, ws, setSingleChatData } = props
    const [msg, setMsg] = useState<string>('')
    const messageContainerRef = useRef<HTMLDivElement | null>(null)

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement | HTMLDivElement>) => {
        e.preventDefault()
        if (msg != '') {
            const newMessage = { "created_at": "time", "is_read": false, "message": msg as string, "sender_id": userId }

            const newMessageArr = [...singleChatData.messages, newMessage]

            // update the messages array inside singleChatData state.
            setSingleChatData((prevState: SingleChatData) => ({
                ...prevState, ["messages"]: newMessageArr
            }));

            const message = { action: "sendMessage", text: msg, chat_id: singleChatData.chat_id }
            ws.send(JSON.stringify(message))

            setMsg('')
        }


    }

    useEffect(() => {
        messageContainerRef.current?.scrollIntoView({ behavior: 'smooth' }); // scroll to bottom on new message
        // if (ws) {
        //     ws.onmessage = (e) => {
        //         const message: WsMessage = JSON.parse(e.data);
        //         switch (message.Action) {
        //             // Receive message in real-time from the websocket server.
        //             case "newMessage":
        //                 const newMessageArr = [...singleChatData!.messages, message.Content]

        //                 // update the messages array inside singleChatData state.
        //                 if (singleChatData) {
        //                     setSingleChatData((prevState: SingleChatData) => ({
        //                         ...prevState, ["messages"]: newMessageArr
        //                     }));
        //                 }

        //                 break;
        //             default:
        //                 break;
        //         }
        //     }
        // }
        return () => {
            setMsg('')
        }
    }, [singleChatData])



    return (
        <div className={styles.ChatMessage}>
            <div className={styles.ChatMessage_content_header}>
                {userId == singleChatData.store_id ?
                    <h3>{`${singleChatData.client_first_name} ${singleChatData.client_last_name}`}</h3>
                    :
                    <h3>{singleChatData.store_name}</h3>
                }
            </div>
            <div className={styles.ChatMessage_content_messages}>
                <div className={styles.ChatMessage_messages_container} >
                    {singleChatData.messages.map((msg, i) => {
                        return <div key={i} className={styles.ChatMessage_messages_single_blob} style={msg.sender_id === userId ? currentUserMessageStyle : otherUserMessageStyle}>
                            {msg.message}
                        </div>
                    })}
                    <div ref={messageContainerRef} />
                </div>
            </div>
            <div className={styles.ChatMessage_content_send}>
                <form onSubmit={e => handleSendMessage(e)}>
                    <input type="text" onChange={e => setMsg(e.target.value)} value={msg} />
                    <div onClick={(e) => handleSendMessage(e)}><ReplySvg /></div>
                </form>
            </div>
        </div>
    )
}

export default ChatMessage