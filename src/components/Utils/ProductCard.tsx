import Link from 'next/link';
import styles from '../../styles/components/Utils/ProductCard.module.scss'
import Rating from './Rating';

type Props = {
    id: string;
    title: string;
    image: string;
    rating: number;
    reviewsCount: number;
};

const ProductCard = ({ id, title, image, rating, reviewsCount }: Props) => {

    return (
        <Link href={"product/" + id} key={id} passHref legacyBehavior>
            <a>
                <div className={styles.ProductCard}>
                    <div className={styles.ProductCard_image}>
                        <img src={"https://apifm.joaquinolivero.com/images/products/" + image} alt="" />
                    </div>
                    <div className={styles.ProductCard_title}>{title}</div>
                    <div className={styles.ProductCard_rating}>
                        <Rating value={rating} />
                        <div style={{ fontSize: "14px", letterSpacing: "0.8px" }}>{rating}</div>
                        <div style={{ fontSize: "12px", letterSpacing: "0.8px", opacity: "0.6" }}>({reviewsCount} reviews)</div>
                    </div>
                </div>
            </a>
        </Link>
    )
}

export default ProductCard