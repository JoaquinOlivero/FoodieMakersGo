import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../../../../../contexts/AuthContext'
import styles from '../../../../../../styles/components/Navbar/components/UserMenu/components/UserNavigation/UserNavigation.module.scss'
import Modal from '../../../../../Utils/Modal'
import Button from '../../../../../Utils/Button'
import Spinner from '../../../../../Utils/Spinner'
import InboxSvg from '../../../../../Utils/svg/InboxSvg'
import PlusSvg from '../../../../../Utils/svg/PlusSvg'
import UserSvg from '../../../../../Utils/svg/UserSvg'
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

interface WsMessage {
    Action: string
    Content: ChatsData[]
}

const wsURL = 'wss://api.foodiemakers.xyz/ws' // Change this to an env variable

const UserNavigation = () => {
    const router = useRouter()
    const { hasStore, logout, userId } = useAuth()
    const [modal, setModal] = useState<boolean>(false)
    const [pName, setPName] = useState<string>('')
    const [pDescription, setPDescription] = useState<string>('')
    const [pCategory, setPCategory] = useState<string>('dairy')
    const [images, setImages] = useState<any>([])
    const [imagesUrl, setImagesUrl] = useState<Array<string>>([])
    const [loading, setLoading] = useState<boolean>(false)
    const imageLabel = useRef<HTMLLabelElement>(null)
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [inboxModal, setInboxModal] = useState<boolean>(false)
    const inboxModalRef = useRef<HTMLDivElement>(null)
    const [chatsData, setChatsData] = useState<Array<ChatsData> | null>(null)
    const [chatsLoaded, setChatsLoaded] = useState<boolean>(false)
    const [unreadMessages, setUnreadMessages] = useState<boolean>(false)
    const [userModal, setUserModal] = useState<boolean>(false)
    const userModalRef = useRef<HTMLDivElement>(null)

    const closeModal = () => {
        setModal(false)
        setPName('')
        setPCategory('')
        setPDescription('')
        setImages([])
        setImagesUrl([])
    }

    const handleImage = async (e: any) => {
        const imageFiles = e.target.files
        setImages([])
        setImagesUrl([])

        for (const key in imageFiles) {
            if (Object.prototype.hasOwnProperty.call(imageFiles, key)) {
                const image = imageFiles[key];
                const formData = new FormData()
                formData.append('image', image)
                setImages((state: any) => [...state, formData])
                setImagesUrl(state => [...state, URL.createObjectURL(image)])
            }
        }
    }

    const handleSelectImageClick = () => {
        const label = imageLabel.current
        label!.click()
    }

    const handleProductSubmit = async (e: any) => {
        e.preventDefault()
        setLoading(true)

        // Body for POST request when creating/publishing a new product. 
        type productBody = {
            product_title: string,
            product_description: string,
            product_category: string,
            product_images: string[]
        }

        // Upload images to the server, get their urls and send a POST request to save the product data in the database.
        const productImages: string[] = []

        // Get images URLs and store them in an array for later use when saving the product details in the DB
        for (let index = 0; index < images.length; index++) {
            const formData = images[index];
            const url = 'https://api.foodiemakers.xyz/product/upload-image'
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                body: formData
            })
            if (res.status === 200) {
                const data = await res.json()
                const imageUrl = data.image_url
                productImages.push(imageUrl)
            } else {
                console.log('error');
            }
        }

        // Save product to database.
        const url = 'https://api.foodiemakers.xyz/product/new'
        const productDetails: productBody = { "product_title": pName, "product_description": pDescription, "product_category": pCategory, "product_images": productImages }
        console.log(productDetails);
        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productDetails)
        })
        if (res.status === 200) {
            const data = await res.json()
            const productUrl = `https://foodiemakers.xyz/product/${data.product_id}`
            return router.push(productUrl)
        } else {
            console.log(await res.json())
        }
        setLoading(false)
        return
    }

    // WEBSOCKET CONNECTION
    useEffect(() => {
        setWs(new WebSocket(wsURL + `?userId=${userId}`))
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
                        setChatsData(message.Content as ChatsData[])
                        setChatsLoaded(true)
                        break;
                    default:
                        break;
                }

            }
        }

        return () => {
            if (ws) {
                // ws.onclose = () => {
                //     // console.log('WebSocket Disconnected');
                // }
                ws.close()
            }

        }
    }, [ws])


    useEffect(() => {
        if (chatsData) {
            // Loop through latest messages and check if there are unread messages.
            let i = 0
            const len = chatsData.length;
            while (i < len) {
                if (userId !== chatsData[i].latest_message.sender_id && !chatsData[i].latest_message.is_read) {
                    setUnreadMessages(true)
                    break;
                }

                i++
            }
        }
    }, [chatsData])


    // handle outside click of inbox modal and user modal
    useEffect(() => {

        function handleClickOutside(event: any) {
            if (inboxModalRef.current && !inboxModalRef.current.contains(event.target)) {
                setInboxModal(false)
            }
            if (userModalRef.current && !userModalRef.current.contains(event.target)) {
                setUserModal(false)
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getMessageDate = (date: string) => {
        const today = new Date(Date.parse(Date()))
        const messageDate = new Date(Date.parse(date));

        if (today.getFullYear() !== messageDate.getFullYear()) return `${today.getFullYear() - messageDate.getFullYear()}y ago`
        if (today.getMonth() !== messageDate.getMonth()) return `${today.getMonth() - messageDate.getMonth()}m ago`
        if (today.getDate() !== messageDate.getDate()) return today.getDate() - messageDate.getDate() === 1 ? "Yesterday" : `${today.getDate() - messageDate.getDate()}d ago`

        return `${messageDate.getHours()}:${messageDate.getMinutes()}`
    }

    // handler for clicking on chat.
    const handleChatClick = (chatId: string) => {
        router.push({
            pathname: `https://foodiemakers.xyz/chat`,
            query: { "chat_id": chatId }
        })
    }

    return (
        <div className={styles.UserNavigation}>

            <div className={styles.UserNavigation_left}>
                {hasStore && <PlusSvg onClick={() => setModal(true)} style={modal ? { opacity: 1, fill: '#fd2922c4' } : {}} />}
                <div className={styles.UserNavigation_left_inbox} ref={inboxModalRef} >
                    <InboxSvg onClick={() => setInboxModal(!inboxModal)} style={inboxModal ? { opacity: 1, fill: '#fd2922c4' } : {}} />
                    {unreadMessages && <div className={styles.UserNavigation_inbox_unread}></div>}
                    {inboxModal && <div className={styles.UserNavigation_inbox_modal} >
                        {chatsLoaded ?
                            chatsData?.map((chat) => {
                                return (
                                    <div key={chat.chat_id} className={styles.ChatMenu_single_chat} onClick={() => handleChatClick(chat.chat_id)}>
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
                            })

                            :
                            <div className={styles.Chat_spinner}>
                                <Spinner size={30} />
                            </div>

                        }
                        {chatsLoaded &&
                            <Link href="/chat">
                                <span>See all chats</span>
                            </Link>
                        }
                    </div>}
                </div>
                {/* <img src="/icons/bell.svg" alt="notification" /> */}
            </div>
            <div className={styles.UserNavigation_right}>
                <div ref={userModalRef}>
                    <UserSvg onClick={() => setUserModal(!userModal)} style={userModal ? { opacity: 1, fill: '#fd2922c4' } : {}} />
                    {userModal &&
                        <div className={styles.UserNavigation_user_modal} >
                            <span>Settings</span>
                            <span onClick={logout}>Log Out</span>
                        </div>
                    }
                </div>
            </div>
            {modal &&
                <Modal onClickOutside={closeModal} onExit={closeModal}>
                    <div className={styles.UserNavigation_publish_modal}>
                        <h1>Publish New Product</h1>
                        <form onSubmit={e => handleProductSubmit(e)}>
                            <div className={styles.UserNavigation_form_input}>
                                <label>Product Name</label>
                                <input type="text" required value={pName} onChange={e => setPName(e.target.value)} />
                            </div>
                            <div className={styles.UserNavigation_form_input}>
                                <label>Description</label>
                                <textarea required value={pDescription} onChange={e => setPDescription(e.target.value)} />
                            </div>
                            <div className={styles.UserNavigation_form_input}>
                                <label>Category</label>
                                <select onChange={e => setPCategory(e.target.value)} defaultValue='dairy'>
                                    <option value="dairies">Dairies</option>
                                    <option value="snacks">Snacks</option>
                                    <option value="frozen-foods">Frozen Foods</option>
                                    <option value="pasta">Pasta & Noodles</option>
                                    <option value="bread-bakery">Bread & Bakery</option>
                                    <option value="oils">Oils & Vinegars</option>
                                    <option value="beverages">Beverages</option>
                                    <option value="alcohol">Wines & Alcohol Drinks</option>
                                    <option value="canned-goods">Canned Goods</option>
                                    <option value="dry-goods">Dry Goods</option>
                                </select>
                            </div>
                            <div className={styles.UserNavigation_form_input}>
                                <label htmlFor="file-upload" style={{ cursor: 'pointer' }} ref={imageLabel}>Images</label>
                                <input type="file" id="file-upload" multiple={true} accept="image/*" onChange={e => handleImage(e)} required />
                                <span className={styles.UserNavigation_form_image_select} onClick={handleSelectImageClick}>Select images</span>
                            </div>
                            <div className={styles.UserNavigation_form_images_selected}>
                                {imagesUrl.length > 0 &&
                                    imagesUrl.map((url, index) => {
                                        return <img key={index} src={url} alt={`image-selected-${index}`} />
                                    })
                                }
                            </div>

                            {loading ? <Spinner size={25} /> : <Button text='Publish Product' />}
                        </form>
                    </div>
                </Modal>
            }
        </div>
    )
}

export default UserNavigation