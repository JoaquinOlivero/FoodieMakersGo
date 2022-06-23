import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  // const { user, login, logout, userDetails } = useAuth();

  // useEffect(() => {
  //   const checkToken = async () => {
  //     const url = "https://api.foodiemakers.xyz/user/check-token"
  //     try {
  //       const res = await fetch(url, {
  //         method: 'POST',
  //         credentials: 'include',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       })
  //       const data = await res.json()
  //       // userDetails(data.user_id)
  //       // login()
  //       console.log(user);

  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }

  //   checkToken()
  // }, [])


  return (
    <>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}

export default MyApp
