import Link from "next/link"
import styles from "../../../../styles/components/Navbar/components/Logo/Logo.module.scss"

const Logo = () => {
    return (
        <div className={styles.Logo}>
            <Link href='/'>
                <span>FoodieMakers</span>
            </Link>
        </div>
    )
}

export default Logo