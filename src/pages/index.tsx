import { GetServerSideProps } from "next";
import cookieParser from '../utils/cookieParser';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar'
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Home.module.scss'

type tokenData = {
  data: {
    user_id: string
    has_store: boolean
  } | null
}

const Home = ({ data }: tokenData) => {
  const [loading, setLoading] = useState(true)
  const { userDetails } = useAuth();

  useEffect(() => {
    if (data) {
      const userId = data.user_id
      const hasStore = data.has_store
      userDetails(userId, hasStore)
    }
    setLoading(false)
  }, [])


  return (
    <div className={styles.Home}>
      {!loading &&
        <Navbar />
      }
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const cookies = context.req.headers.cookie
  if (cookies) {
    const parsedCookies = cookieParser(cookies)
    const cookieToken = parsedCookies.cookieToken
    const url = "https://apifm.joaquinolivero.com/user/check-token"
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cookie': cookieToken
        },
      })
      const data: tokenData = await res.json()

      return {
        props: { data }
      }
    } catch (error) {
      return {
        notFound: true,
      }
    }
  }
  const data = null
  return {
    props: { data }
  }
}