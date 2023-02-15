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
                    <p>{description}. Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti, non rerum. Qui praesentium ipsum a quidem atque aperiam incidunt quae, aliquid voluptas neque ipsa maxime animi ut fugiat deserunt mollitia.
                        Molestiae error dicta nam. Dolorum vel, temporibus totam consequuntur dolore tenetur veritatis numquam similique dolor animi. Sint at temporibus, nesciunt quasi voluptatum ipsum molestiae dolore aut asperiores minus, velit eius.
                        Ex iusto earum delectus ipsa quod distinctio iste quibusdam excepturi minima fugiat, quaerat, rerum sapiente qui alias dolorem omnis, nam consectetur! Qui deserunt eaque, nemo nihil nam quos hic iusto.
                        Maiores tempore, ipsum iure maxime officiis delectus repellat nam dolores consectetur quibusdam, accusamus dicta esse sint recusandae minus libero minima fuga at molestias, non saepe? Minima autem ea placeat voluptatibus.
                        Corrupti iste adipisci nihil quidem exercitationem. Corrupti dignissimos voluptates nulla magni perferendis repudiandae, error, voluptatibus dolore cupiditate voluptate cum soluta saepe, ex cumque deserunt? Distinctio consequuntur beatae deleniti dolor neque!
                        Ipsam quae aperiam provident earum exercitationem, eligendi sit consectetur cumque laudantium possimus perspiciatis eius facere ducimus! Sed sapiente eius illum a itaque. Necessitatibus, dolores odit quo placeat possimus doloremque hic.
                        Sit facilis quasi quos ipsam excepturi voluptatum, nesciunt vitae illum exercitationem doloribus beatae nihil. Laborum recusandae autem libero soluta adipisci illo a quas illum totam. Ullam, error ipsam? Dicta, atque.
                        Recusandae porro aliquid libero, nulla nemo molestias consequatur eaque tempora alias possimus, totam atque! Blanditiis, reiciendis exercitationem pariatur rem modi voluptatibus beatae explicabo eos aut saepe animi provident sequi officia?
                        Eligendi alias harum maiores. Veniam tempore velit maxime eveniet consectetur commodi soluta quos nihil architecto illum sequi quae, eligendi exercitationem. Distinctio omnis illum ad facilis sint maiores debitis, autem numquam!
                        Exercitationem illo sequi id rerum ut natus esse magni excepturi cupiditate cum numquam non nostrum tempora minus architecto, asperiores quis optio doloribus voluptatem. Nulla vero esse itaque illum ex quas.
                    </p>
                </div>
            </div>

        </div>
    )
}

export default DescriptionCard