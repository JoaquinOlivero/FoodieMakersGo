import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import styles from '../../styles/components/productPage/NewReviewCard.module.scss'
import Button from '../Utils/Button'
import Rating from '../Utils/Rating'
import Spinner from '../Utils/Spinner'

type Props = {
    product_id: string | string[] | undefined
    store_id: string | null
}


const NewReviewCard = (props: Props) => {
    const router = useRouter()
    const ratingRef = useRef<HTMLDivElement>(null)
    const [title, setTitle] = useState('')
    const [review, setReview] = useState('')
    const [ratingValue, setRatingValue] = useState<number>(2.5)
    const [defaultRatingValue, setDefaultRatingValue] = useState<number>(2.5)
    const { product_id, store_id } = props
    const [isMouseOutside, setIsMouseOutside] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleNewReview = async (e: any) => {
        e.preventDefault()
        setIsLoading(true)
        const url: string = 'https://api.foodiemakers.xyz/review/new'
        const bodyDetails = {
            "review_title": title,
            "review_content": review,
            "review_rating": defaultRatingValue,
            "review_product_id": product_id,
            "review_store_id": store_id
        }
        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyDetails)
        })
        const data = await res.json()
        if (res.status === 200) {
            // refresh
            router.reload()
        }
    }

    const handleMoveRating = (e: any) => {
        setIsMouseOutside(false)
        const ratingDiv = ratingRef.current

        var rect = ratingDiv!.getBoundingClientRect();
        var x = (e.clientX - rect.left) / 2; //x position within the element.
        const rating = x / 10
        const roundedRating = Math.round(rating * 2) / 2 + .5

        // setDefaultRatingValue(roundedRating)
        setRatingValue(roundedRating)
    }

    const handleClickRating = (e: any) => {
        const ratingDiv = ratingRef.current

        var rect = ratingDiv!.getBoundingClientRect();
        var x = (e.clientX - rect.left) / 2; //x position within the element.
        const rating = x / 10
        const roundedRating = Math.round(rating * 2) / 2 + .5

        setDefaultRatingValue(roundedRating)
    }

    return (
        <div className={styles.NewReviewCard}>
            <h2>Leave a Review</h2>
            <form onSubmit={e => handleNewReview(e)} className={styles.NewReviewCard_form}>
                <div className={styles.NewReviewCard_form_input}>
                    <label>Title</label>
                    <input type="text" onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className={styles.NewReviewCard_form_rating}>
                    <label>Rate Product</label>
                    <div onClick={e => { handleClickRating(e) }} onMouseMove={e => handleMoveRating(e)} onMouseLeave={() => setIsMouseOutside(true)} ref={ratingRef}>
                        <Rating value={isMouseOutside ? defaultRatingValue : ratingValue} />
                    </div>
                    <span>{isMouseOutside ? defaultRatingValue : ratingValue}</span>
                </div>
                <div className={styles.NewReviewCard_form_input}>
                    <label>Review</label>
                    <textarea cols={30} rows={10} onChange={e => setReview(e.target.value)} required />
                </div>
                <div className={styles.NoReviewCard_form_button}>
                    {isLoading && <Spinner size={20} />}
                    <Button text='Submit' />
                </div>
            </form>
        </div>
    )
}

export default NewReviewCard