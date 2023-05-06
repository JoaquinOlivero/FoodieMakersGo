import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar/Navbar'
import styles from '../styles/Home.module.scss'
import ProductCard from '../components/Utils/ProductCard'
import Image from 'next/image'

type Product = {
  Category: string,
  Id: string,
  Images: [string],
  Rating: number,
  Title: string
  ReviewsCount: number
}

type Category = {
  Name: string,
  Products: [Product]
}

const topProducts: [Category] | any[] = []

const bannerLoader = () => {
  return "https://apifm.joaquinolivero.com/images/banner.png";
}

const Home = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("https://apifm.joaquinolivero.com/home")
      .then(res => res.json())
      .then((data: [Product]) => {

        data.map((product: Product) => {

          if (topProducts.length === 0) {
            const newCategory: Category = { "Name": product.Category, "Products": [product] }
            topProducts.push(newCategory)
          } else if (topProducts.length > 0) {

            const category = topProducts.findIndex((c: Category) => product.Category === c.Name)

            if (category === -1) {
              const newCategory: Category = { "Name": product.Category, "Products": [product] }
              topProducts.push(newCategory)
            }

            if (category !== -1) {
              topProducts[category].Products.push(product)
            }
          }

        })

        setLoading(false)
      })
      .catch(err => console.log(err))

    return () => {
      topProducts.length = 0
    }

  }, [])

  return (
    <div className={styles.Home}>
      <Navbar />
      {!loading && topProducts &&
        <div className={styles.Home_content}>
          <div className={styles.Home_content_image}>
            <Image loader={bannerLoader} src={"https://apifm.joaquinolivero.com/images/banner.png"} layout='fill' objectFit='contain' />
          </div>
          {
            topProducts.map((category: Category) => {
              return <div key={category.Name} className={styles.Home_content_category}>
                <div className={styles.Home_category_title}>top {category.Name}</div>
                <div className={styles.Home_category_products}>
                  {category.Products.map((product: Product) => {
                    return <ProductCard key={product.Id} id={product.Id} title={product.Title} image={product.Images[0]} rating={product.Rating} reviewsCount={product.ReviewsCount} />
                  })}
                </div>
              </div>
            })
          }
        </div>
      }
    </div>
  )
}

export default Home