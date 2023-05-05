import { useRef, useState } from "react";
import styles from "../../styles/components/productPage/ProductCard.module.scss";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../Utils/Button";
import Wishlist from "../Utils/Wishlist";
import Rating from "../Utils/Rating";
import Modal from "../Utils/Modal";
import EditProduct from "./components/EditProduct";
import DeleteProduct from "./components/DeleteProduct";
import BankSvg from "../Utils/svg/BankSvg";
import BitcoinSvg from "../Utils/svg/BitcoinSvg";
import CardSvg from "../Utils/svg/CardSvg";
import { NextRouter } from "next/router";

type ProducData = {
  data: {
    title: string;
    images: [string];
    category: string;
    category_id: number;
    store_id: string;
    store_name: string;
    store_city: string;
    store_state: string;
    payment_methods: [string];
    rating: number;
    reviews_count: number;
    description: string;
  };
  productId: string | string[] | undefined;
  router: NextRouter
};

const ProductCard = ({ data, productId, router }: ProducData) => {
  const { userId } = useAuth();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [imageIndex, setImageIndex] = useState<number>(0);

  const closeModal = () => {
    setModal(false);
    if (edit) setEdit(false);
    if (isDelete) setIsDelete(false);
  };

  const handleContactManufacturer = async () => {
    const url = 'https://apifm.joaquinolivero.com/chat/new'
    const bodyDetails = { "store_id": data.store_id }
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyDetails)
    })

    if (res.status === 200 || res.status === 302) {
      // CHAT CREATED OR CHAT ALREADY EXISTS
      const data = await res.json()
      const chatId = data.chat_id
      router.push({
        pathname: `https://fm.joaquinolivero.com/chat`,
        query: { "chat_id": chatId }
      })
    }
  }

  return (
    <div className={styles.ProductCard}>
      {modal && edit && (
        <Modal onExit={closeModal} onClickOutside={closeModal}>
          <EditProduct title={data.title} images={data.images} category={data.category} description={data.description} category_id={data.category_id} />
        </Modal>
      )}
      {modal && isDelete && (
        <Modal onExit={closeModal} onClickOutside={closeModal}>
          <DeleteProduct title={data.title} productId={productId} />
        </Modal>
      )}
      <div className={styles.ProductCard_content}>
        {/* Images div */}
        <div className={styles.ProductCard_content_images}>
          {/* Thumbnails */}
          <div className={styles.ProductCard_content_images_thumbnails}>
            {data.images.map((image: string, index: number) => {
              return <img key={index} src={"https://apifm.joaquinolivero.com/images/products/" + image} onClick={() => setImageIndex(index)} style={index === imageIndex ? { opacity: 1 } : undefined} />;
            })}
          </div>

          {/* Image slider */}
          <div className={styles.ProductCard_container_slide} ref={sliderRef}>
            <div className={styles.ProductCard_slide_content}>
              <img src={"https://apifm.joaquinolivero.com/images/products/" + data.images[imageIndex]} alt="" />
            </div>
          </div>
        </div>

        {/* Details div */}
        <div className={styles.ProductCard_content_details}>
          {userId && userId === data.store_id && (
            <div className={styles.ProductCard_content_details_owner_buttons}>
              <span
                onClick={() => {
                  setModal(true);
                  setEdit(true);
                }}
              >
                Edit Product
              </span>
              <span
                onClick={() => {
                  setModal(true);
                  setIsDelete(true);
                }}
              >
                Delete Product
              </span>
            </div>
          )}
          <div className={styles.ProductCard_details_header}>
            <h1>{data.title}</h1>
            {data.reviews_count > 0 &&
              <div className={styles.ProductCard_header_reviews}>
                <div className={styles.ProductCard_header_reviews_rating}>
                  <Rating value={data.rating} />
                  <span>{data.rating}</span>
                </div>
                <div className={styles.ProductCard_header_reviews_count}>({data.reviews_count === 1 ? `${data.reviews_count} review` : `${data.reviews_count} reviews`})</div>
              </div>
            }
            <div className={styles.break}></div>
          </div>

          <div className={styles.ProductCard_details_store}>
            <p>
              <span>Manufacturer - </span>
              {data.store_name}
            </p>
            <p>
              <span>City - </span>
              {data.store_city}, {data.store_state}
            </p>
            <p>
              <span>Category - </span>
              {data.category}
            </p>
            <div className={styles.break}></div>
          </div>

          <div className={styles.ProductCard_details_wishlist}>
            <Wishlist />
            <span>Add to Wishlist</span>
          </div>

          <div className={styles.ProductCard_details_payment}>
            <span>Accepted payment methods</span>
            <div className={styles.ProductCard_details_payment_methods}>
              {data.payment_methods.map((method) => {
                return (
                  <div key={method} className={styles.ProductCard_details_payment_method}>
                    {method === "bank_transfer" && (
                      <div>
                        <BankSvg />
                        <span>Bank Transfer</span>
                      </div>
                    )}

                    {method === "crypto" && (
                      <div>
                        <BitcoinSvg />
                        <span>Crypto</span>
                      </div>
                    )}

                    {method === "credit_card" && (
                      <div>
                        <CardSvg />
                        <span>Credit Card</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {userId !== data.store_id &&
            <div className={styles.ProductCard_details_contact} onClick={handleContactManufacturer}>
              <Button text="Contact Manufacturer" />
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
