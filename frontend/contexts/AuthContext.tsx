import { createContext, useContext, ReactNode, useState } from "react";

type authContextType = {
    user: boolean | null;
    userId: string | null;
    login: () => void,
    logout: () => void,
    userDetails: (id: string) => void,
    checkToken: () => void,
}

const authContextDefaultValues: authContextType = {
    user: null,
    userId: null,
    login: () => { },
    logout: () => { },
    userDetails: () => { },
    checkToken: () => { },
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

    const login = () => {
        setUser(true);
    };

    const logout = async () => {
        setUser(false);
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
            }
            return
        } catch (error) {
            return error
        }
    };

    const userDetails = (id: string) => {
        setUserId(id)
    }

    const checkToken = async () => {
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
                userDetails(data.user_id)
                login()
            }
            return
        } catch (error) {
            return error
        }
    }

    const value = {
        user,
        userId,
        login,
        logout,
        userDetails,
        checkToken
    };

    return (
        <>
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </>
    );
}