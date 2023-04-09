import { GetServerSideProps } from "next";
import Navbar from "../components/Navbar/Navbar";
import styles from '../styles/Search.module.scss'
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
    query: string
}

const Search = ({ data, query }: Props) => {


    return (
        <>
            <Navbar />
            <div className={styles.Search}>
                {data ?
                    <div className={styles.Search_result}>{data.map((p: ApiResponse) => {
                        return <ProductCard key={p.Id} id={p.Id} title={p.Title} image={p.Images[0]} rating={p.Rating} reviewsCount={p.ReviewsCount} />
                    })}</div>
                    :
                    <div className={styles.Search_not_found}>The search for <span>{query}</span> did not return any results.</div>
                }
            </div>
        </>
    )
}

export default Search

export const getServerSideProps: GetServerSideProps = async (context: any) => {
    // Get search query
    const q = context.query.q
    const res = await fetch(`https://apifm.joaquinolivero.com/product/search?q=${q}`)
    const data: [ApiResponse] = await res.json()
    if (res.status !== 200) { // If product does not exist return a next.js' not found (404 page)
        return {
            notFound: true,
        }
    }

    return {
        props: {
            data: data, // Array of products found
            query: q // String that is the search text made by the user.
        }
    }
}