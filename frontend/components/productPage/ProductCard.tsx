import { useEffect, useRef, useState } from 'react'
import Link from "next/link";
import { useRouter } from 'next/router'
import styles from '../../styles/components/productPage/ProductCard.module.scss'
import { useAuth } from '../../contexts/AuthContext';



const ProductCard = ({ data }: any) => {
    const { user, checkToken } = useAuth();
    const router = useRouter()
    const sliderRef = useRef<HTMLDivElement>(null)
    const [selectedThumbnail, setSelectedThumbnail] = useState<number>(0)

    useEffect(() => {
        const productImageIndexUrl: string = router.asPath.split("#")[1]
        if (productImageIndexUrl) {
            const indexThumbnail: string = router.asPath.charAt(router.asPath.length - 1)
            setSelectedThumbnail(parseInt(indexThumbnail, 10))
        }
        // checkToken()

    }, [])

    // useEffect(() => {
    //     console.log(user);
    // }, [user])


    return (
        <div className={styles.ProductCard}>
            <div className={styles.ProductCard_content}>

                {/* Images div */}
                <div className={styles.ProductCard_content_images}>
                    {/* Thumbnails */}
                    <div className={styles.ProductCard_content_images_thumbnails}>
                        {data.images.map((image: string, index: number) => {
                            return <Link key={`#product-image-thumbnail-${index}`} href={`#product-image-${index}`}><img src={image} onClick={() => setSelectedThumbnail(index)} style={index === selectedThumbnail ? { opacity: 1 } : {}} /></Link>
                        })}
                    </div>

                    {/* Image slider */}
                    <div className={styles.ProductCard_content_images_slides} ref={sliderRef}>
                        {data.images.map((image: string, index: number) => {
                            return <img key={`product-image-${index}`} src={image} id={`product-image-${index}`}></img>
                        })}
                    </div>
                </div>

                {/* Details div */}
                <div className={styles.ProductCard_content_details}>
                    <div>
                        <h1>{data.title}</h1>
                        <p>rating</p>
                        <div className={styles.break}></div>
                    </div>

                    <div>
                        <p>Manufacturer: {data.store_name}</p>
                        <p>City: {data.store_city}, {data.store_state}</p>
                        <p>Category: {data.category}</p>
                        <div className={styles.break}></div>
                    </div>

                    <div>
                        <span>Add to wishlist</span>
                    </div>

                    <div className={styles.ProductCard_details_contact}>
                        <span className={styles.btn}>Contact Manufacturer</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCard