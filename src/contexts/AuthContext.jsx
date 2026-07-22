/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/immutability */
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [user, setUser] = useState(() => {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    })

    const validateToken = async () => {
        if (!token) return false

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data)
                localStorage.setItem('user', JSON.stringify(data))
                return true
            } else {
                logout()
                return false
            }
        } catch {
            logout()
            return false
        }
    }

    useEffect(() => {
        if (token) {
            validateToken()
        }
    }, [token])

    const login = (userData, authToken) => {
        setUser(userData)
        setToken(authToken)
        localStorage.setItem('token', authToken)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    const isAuthenticated = !!token && !!user

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            login,
            logout,
            validateToken
        }}>
            {children}
        </AuthContext.Provider>
    )
}