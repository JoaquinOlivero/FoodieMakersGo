import styles from '../../styles/components/productPage/DescriptionCard.module.scss'

type Description = {
    description: string
}

const DescriptionCard = ({ description }: Description) => {
    return (
        <div className={styles.DescriptionCard}>
            <div className={styles.DescriptionCard_content}>
                <h2>Description</h2>
                <div>
                    <p>{description}</p>
                </div>
            </div>

        </div>
    )
}

export default DescriptionCard