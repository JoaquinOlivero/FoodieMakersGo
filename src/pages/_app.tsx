import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../contexts/AuthContext'
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <>
      <AuthProvider>
        <Head>
          <title>FoodieMakers</title>
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}

export default MyApp
