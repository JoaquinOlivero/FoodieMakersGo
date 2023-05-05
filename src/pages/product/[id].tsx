import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import DescriptionCard from "../../components/productPage/DescriptionCard";
import NewReviewCard from "../../components/productPage/NewReviewCard";
import ProductCard from '../../components/productPage/ProductCard'
import ReviewsCard from "../../components/productPage/ReviewsCard";
import { useAuth } from "../../contexts/AuthContext";
import styles from '../../styles/product/Product.module.scss'
import cookieParser from "../../utils/cookieParser";

type rating = {
    Float64: number
    Valid: boolean
}

type Data = {
    data: {
        title: string
        images: [string]
        category: string
        category_id: number
        store_id: string
        store_name: string
        store_city: string
        store_state: string
        payment_methods: [string]
        description: string
        rating: rating
        reviews_count: number
    },
    tokenData: {
        user_id: string
        has_store: boolean
    } | null,
}

const Product = ({ data, tokenData }: Data) => {
    const router = useRouter()
    const { id } = router.query
    const [loading, setLoading] = useState<boolean>(true)
    const [userHasReview, setUserHasReview] = useState<boolean>(false)
    const { user, userId, userDetails } = useAuth();

    // Sign user in with token
    useEffect(() => {
        if (tokenData) {
            const userId = tokenData.user_id
            const hasStore = tokenData.has_store
            userDetails(userId, hasStore)
        }
        setLoading(false)
    }, [])

    return (
        <>
            {!loading &&
                <Navbar />}
            <div className={styles.Product}>
                <ProductCard data={data} productId={id} router={router} />
                <DescriptionCard description={data.description} />
                {id && !loading && <ReviewsCard id={id} user_id={userId} setUserHasReview={setUserHasReview} router={router} />}
                {user && userId !== data.store_id && !userHasReview && !loading && <NewReviewCard product_id={id} store_id={data.store_id} />}
            </div>

        </>

    )
}

export default Product

export const getServerSideProps: GetServerSideProps = async (context: any) => {
    // Check if product exists and retrieve product data
    const id = context.params.id
    const res = await fetch('http://localhost:4000/product/' + id)
    const data = await res.json()
    if (res.status === 400) { // If product does not exist return a next.js' not found (404 page)
        return {
            notFound: true,
        }
    }

    // Check if user is signed in
    const cookies = context.req.headers.cookie
    if (cookies) {
        const parsedCookies = cookieParser(cookies)
        const cookieToken = parsedCookies.cookieToken
        const url = "http://localhost:4000/user/check-token"
        try {
            // Check token
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'cookie': cookieToken
                },
            })

            // If token is valid
            if (res.status === 200) {
                const tokenData = await res.json()
                return {
                    props: {
                        data, // PRODUCT DATA
                        tokenData, // JWT TOKEN DATA
                    },
                }
            }

            // If token is invalid
            return {
                props: {
                    data, // PRODUCT DATA
                    tokenData: null // JWT TOKEN DATA
                },
            }

        } catch (error) {
            return {
                notFound: true,
            }
        }
    }

    // If the user does not have the corresponding cookies
    return {
        props: {
            data, // PRODUCT DATA
            tokenData: null // JWT TOKEN DATA
        },
    }
}