import UserMenu from "./components/UserMenu/UserMenu"
import styles from "../../styles/components/Navbar/Navbar.module.scss"
import SearchBar from "./components/SearchBar/SearchBar"
import Logo from "./components/Logo/Logo"

const Navbar = () => {

    return (
        <div className={styles.Navbar}>
            <div className={styles.Navbar_content}>
                <Logo />
                <SearchBar />
                <UserMenu />
            </div>
        </div>
    )
}

export default Navbar