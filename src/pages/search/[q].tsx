import { GetServerSideProps } from "next";

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
            <div>{data.map((p: ApiResponse) => {
                return <div>{p.Title}</div>
            })}</div>
        </>
    )
}

export default Search

export const getServerSideProps: GetServerSideProps = async (context: any) => {
    // Get search query
    const q = context.params.q
    const res = await fetch(`https://api.foodiemakers.xyz/product/search?q=${q}`)
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