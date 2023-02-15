import { createContext, useContext, ReactNode, useState } from "react";


type authContextType = {
    user: boolean | null;
    userId: string | null;
    hasStore: boolean | null;
    register: (firstName: string, lastName: string, email: string, password: string) => void | Promise<any>,
    login: (email: string, password: string) => void,
    logout: () => void,
    userDetails: (id: string, store: boolean) => void,
    checkToken: () => Promise<string | undefined | number>,
}

const authContextDefaultValues: authContextType = {
    user: null,
    userId: null,
    hasStore: null,
    login: () => { },
    register: () => { },
    logout: () => { },
    userDetails: () => { },
    checkToken: () => Promise.resolve(400),
};

const AuthContext = createContext<authContextType>(authContextDefaultValues);

export function useAuth() {
    return useContext(AuthContext);
}

type Props = {
    children: ReactNode;
};

export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<boolean | null>(null);
    const [userId, setUserId] = useState<string | null>(null)
    const [hasStore, setHasStore] = useState<boolean | null>(null)



    const login = async (email: string, password: string) => {
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
            if (res.status === 200) {
                const data = await res.json()
                setUserId(data.user_id)
                setUser(true);
                setHasStore(data.has_store)
                return res.status
            } else {
                return res.status
            }
        } catch (error) {
            return error
        }
    };

    const register = async (firstName: string, lastName: string, email: string, password: string) => {
        const registerDetails = { "first_name": firstName, "last_name": lastName, "email": email, "password": password }
        const url = "https://api.foodiemakers.xyz/user/register"
        try {
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerDetails)
            })

            if (res.status === 200) {

                await checkToken()
                return res.status
            } else {
                const data: Promise<object> = res.json()
                return data
            }
        } catch (error) {
            return error
        }
    }

    const logout = async () => {


        const url = "https://api.foodiemakers.xyz/user/logout"
        try {
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (res.status === 200) {
                setUserId(null)
                setUser(false);
            }
            return
        } catch (error) {
            return error
        }
    };

    const userDetails = (id: string, store: boolean) => {
        setUser(true)
        setUserId(id)
        setHasStore(store)
    }

    const checkToken = async (): Promise<string | undefined | number> => {
        if (user) return

        const url = "https://api.foodiemakers.xyz/user/check-token"
        try {
            const res = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (res.status === 200) {
                const data = await res.json()
                setUserId(data.user_id)
                setUser(true);
                setHasStore(data.has_store)

                return data.user_id
            }
            return res.status
        } catch (error: any) {
            return error
        }
    }

    const value = {
        user,
        userId,
        login,
        register,
        logout,
        userDetails,
        checkToken,
        hasStore
    };

    return (
        <>
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </>
    );
}