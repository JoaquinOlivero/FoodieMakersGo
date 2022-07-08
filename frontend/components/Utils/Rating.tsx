import StarSvg from "./svg/StarSvg"
import styles from '../../styles/components/Utils/Rating.module.scss'

type RatingProps = {
    value: number
    max?: number
}

const Rating = ({ value, max = 5 }: RatingProps) => {

    /* Calculate how much of the stars should be "filled" */
    const percentage = Math.round((value / max) * 100)

    return (
        <div className={styles.Rating}>
            {/* Create an array based on the max rating, render a star for each */}
            {Array.from(Array(max).keys()).map((_, i) => (
                <StarSvg key={String(i)} />
            ))}
            {/* Render a div overlayed on top of the stars that are not filled */}
            <div className={styles.Rating_overlay} style={{ width: `${100 - percentage}%` }} />
        </div>
    )
}

export default Rating