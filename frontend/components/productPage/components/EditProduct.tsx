import { useRef, useState } from 'react'
import { useRouter } from "next/router";
import styles from '../../../styles/components/productPage/components/EditProduct.module.scss'
import Button from '../../Utils/Button'
import Spinner from '../../Utils/Spinner'

type ProducData = {
  title: string
  images: [string]
  category: string
  description: string
}

const EditProduct = (props: ProducData) => {
  const router = useRouter()
  const { id } = router.query
  const { title, category, description } = props
  const imageLabel = useRef<HTMLLabelElement>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [pName, setPName] = useState<string>('')
  const [pDescription, setPDescription] = useState<string>('')
  const [pCategory, setPCategory] = useState<string>('')
  const [images, setImages] = useState<any>([])
  const [imagesUrl, setImagesUrl] = useState<Array<string>>(props.images)

  const handleImage = async (e: any) => {
    const imageFiles = e.target.files
    setImages([])
    setImagesUrl([])

    for (const key in imageFiles) {
      if (Object.prototype.hasOwnProperty.call(imageFiles, key)) {
        const image = imageFiles[key];
        const formData = new FormData()
        formData.append('image', image)
        setImages((state: any) => [...state, formData])
        setImagesUrl(state => [...state, URL.createObjectURL(image)])
      }
    }
  }

  const handleSelectImageClick = () => {
    const label = imageLabel.current
    label!.click()
  }

  const handleProductSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    // Body for POST request when creating/publishing a new product. 
    type productBody = {
      product_id: string | string[]
      title?: string,
      description?: string,
      category?: string,
      images?: string[]
      old_images?: string[]
    }

    const updateProductDetails: productBody = { "product_id": id! }

    if (pName.length > 0 && pName !== title) updateProductDetails["title"] = pName
    if (pDescription.length > 0 && pDescription !== description) updateProductDetails["description"] = pDescription
    if (pCategory.length > 0 && pCategory !== category) updateProductDetails["category"] = pCategory

    // if new images
    if (images.length > 0) {

      // props.images --> images to be replaced
      const oldImages: string[] = []
      props.images.forEach(url => {
        const imageFileName = url.split("/").pop()
        oldImages.push(imageFileName!)
      });
      updateProductDetails["old_images"] = oldImages

      // Upload images to the server, get their urls and send a POST request to save the product data in the database.
      const productImages: string[] = []

      // Get images URLs and store them in an array for later use when saving the product details in the DB
      for (let index = 0; index < images.length; index++) {
        const formData = images[index];
        const url = 'https://api.foodiemakers.xyz/product/upload-image'
        const res = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          body: formData
        })
        if (res.status === 200) {
          const data = await res.json()
          const imageUrl = data.image_url
          productImages.push(imageUrl)
        } else {
          // console.log('error');
        }
      }

      // Add productImages to updateProductDetails (the body of the POST request)
      updateProductDetails["images"] = productImages
    }

    // Update product in database.
    const url = 'https://api.foodiemakers.xyz/product/update'
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateProductDetails)
    })
    if (res.status === 200) {
      return router.reload()
    }
    setLoading(false)
    return
  }


  return (
    <div className={styles.EditProduct_publish_modal}>
      <h1>Edit Product</h1>
      <form onSubmit={e => handleProductSubmit(e)}>
        <div className={styles.EditProduct_form_input}>
          <label>Product Name</label>
          <input type="text" defaultValue={title} onChange={e => setPName(e.target.value)} />
        </div>
        <div className={styles.EditProduct_form_input}>
          <label>Description</label>
          <textarea defaultValue={description} onChange={e => setPDescription(e.target.value)} />
        </div>
        <div className={styles.EditProduct_form_input}>
          <label>Category</label>
          <select onChange={e => setPCategory(e.target.value)} defaultValue={category}>
            <option value="dairies">Dairies</option>
            <option value="fruits-vegetables">Fruits & Vegetables</option>
            <option value="breads-sweets">Breads Sweets</option>
            <option value="frozen-seafoods">Frozen Seafoods</option>
            <option value="raw-meats">Raw Meats</option>
            <option value="alcohol">Wines & Alcohol Drinks</option>
          </select>
        </div>
        <div className={styles.EditProduct_form_input}>
          <label htmlFor="file-upload" style={{ cursor: 'pointer' }} ref={imageLabel}>Images</label>
          <input type="file" id="file-upload" multiple={true} accept="image/*" onChange={e => handleImage(e)} />
          <span className={styles.EditProduct_form_image_select} onClick={handleSelectImageClick}>Select images</span>
        </div>
        <div className={styles.EditProduct_form_images_selected}>
          {imagesUrl.length > 0 &&
            imagesUrl.map((url, index) => {
              return <img key={index} src={url} alt={`image-selected-${index}`} />
            })
          }
        </div>

        {loading ? <Spinner size={25} /> : <Button text='Update Product' />}
      </form>
    </div>
  )
}

export default EditProduct