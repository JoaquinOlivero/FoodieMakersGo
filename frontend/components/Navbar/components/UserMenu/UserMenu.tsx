import { useAuth } from '../../../../contexts/AuthContext';
import styles from '../../../../styles/components/Navbar/components/UserMenu/UserMenu.module.scss'
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import { useState } from 'react';

const UserMenu = () => {
    const [signInForm, setSignInForm] = useState<boolean>(false)
    const { logout, user } = useAuth();

    return (
        <div className={styles.UserMenu}>
            {!user ?
                <div className={styles.UserMenu_nouser}>
                    <SignIn signInForm={signInForm} setSignInForm={setSignInForm} />
                    {!signInForm && <Register />}
                </div>
                :
                <div onClick={logout}>Logout</div>
            }
        </div>

    )
}

export default UserMenu