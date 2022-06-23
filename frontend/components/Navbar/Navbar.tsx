import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { logout } = useAuth();
    const { user, login } = useAuth();
    const [email, setEmail] = useState<string | null>(null)
    const [password, setPassword] = useState<string | null>(null)

    const handleLogin = async (e: any) => {
        e.preventDefault()
        const loginDetails = { "email": email, "password": password }
        const url = "https://api.foodiemakers.xyz/user/login"
        try {
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginDetails),
            })
            console.log(res.status);
        } catch (error) {
            console.log(error);
        }

    }

    return (
        <div>
            {!user ?
                <div>
                    <form onSubmit={e => handleLogin(e)}>
                        <input type="email" onChange={e => setEmail(e.target.value)} required />
                        <input type="password" onChange={e => setPassword(e.target.value)} required />
                        <button>Login</button>
                    </form>

                </div>
                :
                <div onClick={logout}>Logout</div>
            }
        </div>
    )
}

export default Navbar