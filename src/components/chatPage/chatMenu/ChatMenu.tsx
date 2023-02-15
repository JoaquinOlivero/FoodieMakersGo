import { useState } from "react";
import styles from "../../../styles/components/chatPage/chatMenu/ChatMenu.module.scss";

interface ChatsData {
  chat_id: string;
  client_id: string;
  client_first_name: string;
  client_last_name: string;
  store_id: string;
  store_name: string;
  latest_message: {
    sender_id: string;
    content: string;
    is_read: boolean;
    send_time: string;
    unread_messages: number;
  };
}

type props = {
  chats: ChatsData[];
  userId: string;
  ws: WebSocket
  selectedChatId: string | null
  setSelectedChatId: Function
};

const ChatMenu = (props: props) => {
  const { chats, userId, ws, setSelectedChatId, selectedChatId } = props;

  const handleSingleChatClick = (chatId: string) => {
    const message = { action: "singleChat", chat_id: chatId }
    ws.send(JSON.stringify(message))
    setSelectedChatId(chatId)
  }

  const getMessageDate = (date: string) => {
    const today = new Date(Date.parse(Date()))
    const messageDate = new Date(Date.parse(date));

    if (today.getFullYear() !== messageDate.getFullYear()) return `${today.getFullYear() - messageDate.getFullYear()}y ago`
    if (today.getMonth() !== messageDate.getMonth()) return `${today.getMonth() - messageDate.getMonth()}m ago`
    if (today.getDate() !== messageDate.getDate()) return today.getDate() - messageDate.getDate() === 1 ? "Yesterday" : `${today.getDate() - messageDate.getDate()}d ago`

    return `${messageDate.getHours()}:${messageDate.getMinutes()}`
  }

  return (
    <div className={styles.ChatMenu}>
      <div className={styles.ChatMenu_content}>
        <h2>Chat</h2>
        {chats.map((chat) => {
          return (
            <div key={chat.chat_id} className={styles.ChatMenu_single_chat} style={selectedChatId === chat.chat_id ? { backgroundColor: "white" } : {}} onClick={() => handleSingleChatClick(chat.chat_id)}>
              <div className={styles.ChatMenu_single_chat_content}>
                <div className={styles.ChatMenu_chat_user}>
                  {userId === chat.store_id ? `${chat.client_first_name} ${chat.client_last_name}` : chat.store_name}
                  <div className={styles.ChatMenu_chat_latest_message_time}>{getMessageDate(chat.latest_message.send_time)}</div>
                </div>

                <div className={styles.ChatMenu_chat_latest_message}>
                  <div className={styles.ChatMenu_latest_message_text}>{chat.latest_message.content}</div>
                  {/* unread messages count */}
                  {!chat.latest_message.is_read && chat.latest_message.sender_id !== userId && <div className={styles.ChatMenu_single_chat_dot}>{chat.latest_message.unread_messages}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatMenu;
