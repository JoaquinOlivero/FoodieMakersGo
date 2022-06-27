import { useState } from 'react'
import { useAuth } from '../../../../../../contexts/AuthContext';
import styles from '../../../../../../styles/components/Navbar/components/UserMenu/components/SignIn/SignIn.module.scss'
import Button from '../../../../../Utils/Button';
import Image from 'next/image';
import Spinner from '../../../../../Utils/Spinner';


const SignIn = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [signInForm, setSignInForm] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const handleLogin = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        const res = await login(email!, password!)
        if (res! !== 200) {
            setPassword('')
            setError('Invalid email or password')
        }
        setLoading(false)
    }
    return (
        <div className={styles.SignIn}>
            {!signInForm ?
                <span onClick={() => setSignInForm(true)}>Sign In</span>
                :
                <div>
                    <form onSubmit={e => handleLogin(e)}>
                        <div>
                            <input type="email" onChange={e => setEmail(e.target.value)} required placeholder='Email' value={email} />
                            <input type="password" onChange={e => setPassword(e.target.value)} required placeholder='Password' value={password} />
                        </div>
                        {loading ? <Spinner size={20} /> : <Button text='Sign In' />}
                    </form>

                    <div className={styles.SignIn_formError}>{error}</div>
                </div>
            }
        </div>
    )
}

export default SignIn

