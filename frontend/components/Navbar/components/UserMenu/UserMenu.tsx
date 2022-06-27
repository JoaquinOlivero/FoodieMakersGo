import { useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext';
import styles from '../../../../styles/components/Navbar/components/UserMenu/UserMenu.module.scss'
import SignIn from './components/SignIn/SignIn';

const UserMenu = () => {
    const { logout } = useAuth();
    const { user, login } = useAuth();
    const [email, setEmail] = useState<string | null>(null)
    const [password, setPassword] = useState<string | null>(null)

    const handleLogin = (e: any) => {
        e.preventDefault()
        login(email!, password!)
    }
    return (
        <div className={styles.UserMenu}>
            {!user ?
                <div className={styles.UserMenu_nouser}>
                    <SignIn />

                </div>
                :
                <div onClick={logout}>Logout</div>
            }
        </div>

    )
}

export default UserMenu