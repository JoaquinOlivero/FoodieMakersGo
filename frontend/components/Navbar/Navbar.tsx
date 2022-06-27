import UserMenu from "./components/UserMenu/UserMenu"
import styles from "../../styles/components/Navbar/Navbar.module.scss"
import SearchBar from "./components/SearchBar/SearchBar"

const Navbar = () => {

    return (
        <div className={styles.Navbar}>
            <div className={styles.Navbar_content}>
                <div className={styles.Navbar_logo}>FoodieMakers</div> {/*should be its own component */}
                <SearchBar />
                <UserMenu />
            </div>
        </div>
    )
}

export default Navbar