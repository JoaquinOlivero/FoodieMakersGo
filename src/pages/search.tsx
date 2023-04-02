import { GetServerSideProps } from "next";
import Navbar from "../components/Navbar/Navbar";
import styles from '../styles/Search.module.scss'
import Link from "next/link";
import Rating from "../components/Utils/Rating";
import ProductCard from "../components/Utils/ProductCard";

type ApiResponse = {
    Id: string,
    Title: string,
    Images: [string],
    Rating: number,
    ReviewsCount: number
}

type Props = {
    data: [ApiResponse],
}

const Search = ({ data }: Props) => {
    return (
        <>
            <Navbar />
            <div className={styles.Search}>
                {data && <div className={styles.Search_result}>{data.map((p: ApiResponse) => {
                    return <ProductCard id={p.Id} title={p.Title} image={p.Images[0]} rating={p.Rating} reviewsCount={p.ReviewsCount} />
                })}</div>}
            </div>
        </>
    )
}

export default Search

export const getServerSideProps: GetServerSideProps = async (context: any) => {
    // Get search query
    const q = context.query.q
    const res = await fetch(`https://apifm.joaquinolivero.com/product/search?q=${q}`)
    const data = await res.json()
    if (res.status !== 200) { // If product does not exist return a next.js' not found (404 page)
        return {
            notFound: true,
        }
    }

    return {
        props: {
            data: data
        }
    }
}