import { useEffect } from "react";
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
};

const ChatMenu = (props: props) => {
  const { chats, userId } = props;

  // useEffect(() => {
  //   console.log(chats);
  // }, []);

  return (
    <div className={styles.ChatMenu}>
      <div className={styles.ChatMenu_content}>
        <h2>Chat</h2>
        {chats.map((chat) => {
          return (
            <div key={chat.chat_id} className={styles.ChatMenu_single_chat}>
              <div className={styles.ChatMenu_single_chat_content}>
                <div className={styles.ChatMenu_chat_user}>
                  {userId === chat.store_id ? `${chat.client_first_name} ${chat.client_last_name}` : chat.store_name}
                  <div className={styles.ChatMenu_chat_latest_message_time}>{chat.latest_message.send_time}</div>
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
