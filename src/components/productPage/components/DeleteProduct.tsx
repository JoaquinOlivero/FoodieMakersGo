import { useRouter } from 'next/router'
import { useState } from 'react'
import styles from '../../../styles/components/productPage/components/DeleteProduct.module.scss'
import Button from '../../Utils/Button'
import Spinner from '../../Utils/Spinner'

type Props = {
    title: string
    productId: string | string[] | undefined
}

const DeleteProduct = (props: Props) => {
    const router = useRouter()
    const { title, productId } = props
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleDeleteProduct = async () => {
        setIsLoading(true)
        const deleteDetails = { "product_id": productId }
        const url = 'https://api.foodiemakers.xyz/product/delete'

        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deleteDetails)
        })

        if (res.status === 200) {
            router.push('/')
        }
    }
    return (
        <div className={styles.DeleteProduct_modal}>
            <h1>Confirm</h1>
            <div className={styles.DeleteProduct_confirmation_content}>
                <p>Are you sure you want to remove <span>&ldquo;{title}&ldquo;</span> from your store?</p>
            </div>
            {isLoading ? <Spinner size={20} /> : <Button text='Yes' onClick={handleDeleteProduct} />}
        </div>
    )
}

export default DeleteProduct