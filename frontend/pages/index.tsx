import type { NextPage } from 'next'
import { useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar'
import { useAuth } from '../contexts/AuthContext';

const Home: NextPage = () => {
  const { checkToken } = useAuth();

  useEffect(() => {
    checkToken()
  }, [])


  return (
    <div>
      <Navbar />
    </div>
  )
}

export default Home
