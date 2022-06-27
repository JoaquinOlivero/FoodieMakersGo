import { GetServerSideProps } from "next";
import ProductCard from '../../components/productPage/ProductCard'
import styles from '../../styles/product/Product.module.scss'


type ProductData = {
    data: {
        title: string
        images: []
        category: string
        store_name: string
        store_city: string
        store_state: string
    }
}

const Product = ({ data }: ProductData) => {
    return (
        <div className={styles.Product}>
            <ProductCard data={data} />
        </div>
    )
}

export default Product

export const getServerSideProps: GetServerSideProps = async (context: any) => {
    const id = context.params.id
    const res = await fetch('https://api.foodiemakers.xyz/product/' + id)
    const data: ProductData = await res.json()

    if (!data) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            data,
        },
    }
}