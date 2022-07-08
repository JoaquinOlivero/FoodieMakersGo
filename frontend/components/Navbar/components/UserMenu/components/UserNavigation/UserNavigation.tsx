import { useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../../../../../contexts/AuthContext'
import styles from '../../../../../../styles/components/Navbar/components/UserMenu/components/UserNavigation/UserNavigation.module.scss'
import Modal from '../../../../../Utils/Modal'
import Button from '../../../../../Utils/Button'
import Spinner from '../../../../../Utils/Spinner'

const UserNavigation = () => {
    const router = useRouter()
    const { hasStore, logout } = useAuth()
    const [modal, setModal] = useState<boolean>(false)
    const [pName, setPName] = useState<string>('')
    const [pDescription, setPDescription] = useState<string>('')
    const [pCategory, setPCategory] = useState<string>('dairy')
    const [images, setImages] = useState<any>([])
    const [imagesUrl, setImagesUrl] = useState<Array<string>>([])
    const [loading, setLoading] = useState<boolean>(false)
    const imageLabel = useRef<HTMLLabelElement>(null)

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

    return (
        <div className={styles.UserNavigation}>
            <div className={styles.UserNavigation_left}>
                {hasStore && <img src="/icons/plus.svg" alt="Publish product" onClick={() => setModal(true)} />}
                <img src="/icons/inbox.svg" alt="inbox" />
                <img src="/icons/bell.svg" alt="notification" />
            </div>
            <div className={styles.UserNavigation_right}>
                <img src="/icons/user.svg" alt="user settings" onClick={logout} />
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
                                    <option value="fruits-vegetables">Fruits & Vegetables</option>
                                    <option value="breads-sweets">Breads Sweets</option>
                                    <option value="frozen-seafoods">Frozen Seafoods</option>
                                    <option value="raw-meats">Raw Meats</option>
                                    <option value="alcohol">Wines & Alcohol Drinks</option>
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