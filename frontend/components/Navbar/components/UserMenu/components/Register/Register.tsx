import { useEffect, useState } from 'react'
import styles from '../../../../../../styles/components/Navbar/components/UserMenu/components/Register/Register.module.scss'
import { useAuth } from '../../../../../../contexts/AuthContext';
import Button from '../../../../../Utils/Button'
import Modal from '../../../../../Utils/Modal'
import Spinner from '../../../../../Utils/Spinner';

type Error = {
    inputError: string;
    msg: string;
}

const Register = () => {
    const { register } = useAuth()
    const [modal, setModal] = useState<boolean>(false)
    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [repPassword, setRepPassword] = useState<string>('')
    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(false)


    const closeModal = () => {
        setModal(false)
        setFirstName('')
        setLastName('')
        setEmail('')
        setPassword('')
        setRepPassword('')
        setLoading(false)
    }

    const handleRegister = async (e: any) => {
        e.preventDefault()
        if (error) return
        setLoading(true)
        const res = await register(firstName, lastName, email, password)
        if (res !== 200) {
            const errorCode = res.data.Code
            if (errorCode === "23505") {
                setLoading(false)
                return setError({ inputError: 'email', msg: "Email already in use" })
            }
        }
        setLoading(false)
        return closeModal()

    }

    const handlePasswords = (e: any, type: string) => {
        if (type === 'firstPass') setPassword(e.target.value)
        if (type === 'secondPass') setRepPassword(e.target.value)

    }

    useEffect(() => {
        if (password !== repPassword) {
            setError({ inputError: 'password', msg: "Passwords don't match" })
        } else {
            setError(null)
        }

    }, [password, repPassword])



    return (
        <div className={styles.Register}>
            <div onClick={() => setModal(true)} className={styles.Register_option}>Register</div>
            {modal &&
                <Modal onClickOutside={closeModal} onExit={closeModal}>
                    <div className={styles.Register_modal_content}>
                        <h1>Register</h1>
                        <form onSubmit={e => handleRegister(e)}>
                            <div className={styles.Register_form_input}>
                                <label>First Name</label>
                                <input type="text" required placeholder='First Name' value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div className={styles.Register_form_input}>
                                <label>Last Name</label>
                                <input type="text" required placeholder='Last Name' value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                            <div className={styles.Register_form_input}>
                                <label>Email<span className={styles.Register_formError}>{error && error.inputError === "email" && error.msg}</span></label>
                                <input style={error && error.inputError === 'email' ? { border: '2px solid #df373193' } : {}} type="email" required placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className={styles.Register_form_input}>
                                <label>Password<span className={styles.Register_formError}>{error && error.inputError === "password" && error.msg}</span></label>
                                <input style={error && error.inputError === 'password' ? { border: '2px solid #df373193' } : {}} type="password" required placeholder='Password' value={password} onChange={e => handlePasswords(e, 'firstPass')} />

                            </div>
                            <div className={styles.Register_form_input}>
                                <label>Repeat Password</label>
                                <input style={error && error!.inputError === 'password' ? { border: '2px solid #df373193' } : {}} type="password" required placeholder='Password' value={repPassword} onChange={e => handlePasswords(e, 'secondPass')} />
                            </div>

                            {loading ? <Spinner size={20} /> : <Button text='Register' />}
                        </form>

                    </div>
                </Modal>}
        </div>
    )
}

export default Register