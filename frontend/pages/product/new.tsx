import { useEffect } from "react"
import Navbar from "../../components/Navbar/Navbar"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from 'next/router'

const NewProduct = () => {
  const { checkToken, user, hasStore } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const res = await checkToken()
      if (res! !== 200) router.push('/')
    }

    checkUser()
  }, [])

  useEffect(() => {
    if (hasStore === false) router.push('/')
  }, [user])


  return (
    <>
      {user &&
        <Navbar />
      }
    </>
  )
}

export default NewProduct