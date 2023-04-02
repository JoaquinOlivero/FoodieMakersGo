import { useEffect, useState } from 'react'
import { NextRouter } from 'next/router'
import styles from '../../styles/components/productPage/ReviewsCard.module.scss'
import Spinner from '../Utils/Spinner'
import Rating from '../Utils/Rating'
import TrashCan from '../Utils/svg/TrashCan'

type Review = {
    author_id: string
    content: string
    elapsed_time: string
    rating: number
    review_id: string
    title: string
}

type Props = {
    id: string | string[]
    user_id: string | null
    setUserHasReview: Function
    router: NextRouter
}

const ReviewsCard = (props: Props) => {
    const { id, user_id, setUserHasReview, router } = props
    const [reviews, setReviews] = useState<Array<Review> | null>(null)
    const [reviewsCount, setReviewsCount] = useState<number | null>(null)
    const [reviewsSet, setReviewsSet] = useState<number>(1)
    const [reviewsOffset, setReviewsOffset] = useState<number>(0)
    const [pages, setPages] = useState<Array<number>>([])
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    const getReviews = async (offset: number, set: number) => {
        setPages([])
        setLoading(true)
        setReviewsOffset(offset)
        setReviewsSet(set)

        // If the user is signed in, send the user's id in the request.
        const url = user_id ? `https://apifm.joaquinolivero.com/product/${id}/reviews?offset=${offset}&user_id=${user_id}` : `https://apifm.joaquinolivero.com/product/${id}/reviews?offset=${offset}`
        const res = await fetch(url)
        if (res.status === 200) {
            const data = await res.json()
            setReviews(data.reviews)
            setReviewsCount(data.reviews_count)

            // Check if current user already reviewed product
            if (user_id) {
                setUserHasReview(data.user_has_review);
            }

            // Get total pages
            const totalPages = Math.round(data.reviews_count / 2)
            for (let index = 0; index < totalPages; index++) {
                const pageNumber: number = index + 1
                setPages((state: any) => [...state, pageNumber])
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        getReviews(reviewsOffset, 1)
    }, [])

    const handleDeleteReview = async (review_id: string) => {
        setIsDeleting(true)
        const url = `https://apifm.joaquinolivero.com/review/delete?review_id=${review_id}&product_id=${id}`

        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
        })

        if (res.status === 200) {
            router.reload()
        }
    }

    return (
        <div className={styles.ReviewsCard}>
            <h2>Reviews</h2>
            <div className={styles.ReviewsCard_content}>
                {isLoading ?
                    <div className={styles.ReviewsCard_loading}>
                        <div className={styles.ReviewsCard_loading_review}>
                            <span>Loading... <Spinner size={22} /></span>
                            <div className={styles.ReviewsCard_loading_review_bg}></div>
                        </div>
                        <div className={styles.ReviewsCard_loading_review}>
                            <span>Loading... <Spinner size={22} /></span>
                            <div className={styles.ReviewsCard_loading_review_bg}></div>
                        </div>
                    </div>
                    :
                    reviews ?
                        // Map through all reviews
                        <div className={styles.ReviewsCard_cards_container}>
                            {reviews.map(review => {
                                return <div key={review.review_id} className={styles.ReviewsCard_review}>
                                    <div className={styles.ReviewsCard_review_header}>
                                        <div className={styles.ReviewsCard_review_header_left}>
                                            <h4>{review.title}</h4>
                                            <div className={styles.ReviewsCard_review_header_left_rating}>
                                                <Rating value={review.rating} />
                                                <span>({review.rating})</span>
                                            </div>
                                        </div>

                                        <div className={styles.ReviewsCard_review_header_right}>
                                            {/* Delete review. Only shown to the author of the review */}
                                            {user_id && review.author_id === user_id && <div onClick={() => handleDeleteReview(review.review_id)}>{isDeleting ? <Spinner size={14} /> : <TrashCan />}</div>}
                                            <span>{review.elapsed_time}</span>
                                        </div>
                                    </div>

                                    <div className={styles.ReviewsCard_review_content}>
                                        {review.content}
                                    </div>
                                </div>
                            })}

                            {reviewsCount !== 2 && <div className={styles.ReviewsCard_navigation}>
                                {reviewsSet !== 1 && <span onClick={() => getReviews(reviewsOffset - 2, reviewsSet - 1)}>Previous Page</span>}
                                {reviewsCount && reviewsCount - reviewsOffset > 2 &&
                                    <span onClick={() => getReviews(reviewsOffset + 2, reviewsSet + 1)}>Next Page</span>}
                                <div className={styles.ReviewsCard_navigation_pages}>
                                    {pages.map(page => {
                                        return <div key={page} className={reviewsSet === page ? styles.ReviewsCard_navigation_pages_selected : undefined}>{page}</div>
                                    })}
                                </div>
                            </div>}
                        </div>
                        :
                        <span className={styles.ReviewsCard_loading}>No reviews yet...</span>

                }

            </div>

        </div>
    )
}

export default ReviewsCard