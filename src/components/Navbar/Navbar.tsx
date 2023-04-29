import UserMenu from "./components/UserMenu/UserMenu"
import styles from "../../styles/components/Navbar/Navbar.module.scss"
import SearchBar from "./components/SearchBar/SearchBar"
import Logo from "./components/Logo/Logo"
import { useAuth } from "../../contexts/AuthContext"
import { useEffect, useState } from "react"
import Spinner from "../Utils/Spinner"

const Navbar = () => {
    const [loading, setLoading] = useState(true)
    const { checkToken } = useAuth()

    useEffect(() => {
        checkToken().then(res => {
            setLoading(false)
        })
    }, [])


    return (
        <div className={styles.Navbar}>
            <div className={styles.Navbar_content}>
                <Logo />
                <SearchBar />
                {!loading ?
                    <UserMenu />
                    :
                    <div style={{ width: "30%", display: "flex", justifyContent: "center" }}>
                        <Spinner size={20} />
                    </div>
                }
            </div>
        </div>
    )
}

export default Navbar