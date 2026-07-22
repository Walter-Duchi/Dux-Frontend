/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

const SignalRContext = createContext({})
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const useSignalR = () => useContext(SignalRContext)

export const SignalRProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false)
    const { token, user } = useAuth()

    useEffect(() => {
        // Verificar si el backend tiene SignalR configurado
        const checkSignalRAvailability = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/chatHub`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                // Si la respuesta es válida, podría tener SignalR
                if (response.ok || response.status === 101) {
                    console.log('SignalR parece estar disponible en el backend')
                    setIsConnected(true)
                } else {
                    console.log('SignalR no disponible en el backend. Usando modo fallback.')
                    setIsConnected(false)
                }
            } catch (err) {
                console.log('No se pudo verificar SignalR. Usando modo fallback.')
                setIsConnected(false)
            }
        }

        if (token && user) {
            checkSignalRAvailability()
        }
    }, [token, user])

    // Métodos vacíos para mantener compatibilidad
    const sendPrivateMessage = async (receiverId, content) => {
        console.log('SignalR no disponible - enviando a través de API REST')
        return false
    }

    const sendGroupMessage = async (groupId, content) => {
        console.log('SignalR no disponible - enviando a través de API REST')
        return false
    }

    const joinGroup = async (groupId) => {
        console.log('SignalR no disponible - usando polling')
        return true // Siempre retorna true para permitir el polling
    }

    const leaveGroup = async (groupId) => {
        console.log('SignalR no disponible')
        return true
    }

    return (
        <SignalRContext.Provider
            value={{
                connection: null,
                isConnected,
                sendPrivateMessage,
                sendGroupMessage,
                joinGroup,
                leaveGroup,
                incomingMessages: { privateMessages: [], groupMessages: [] },
                clearIncomingMessages: () => { }
            }}
        >
            {children}
        </SignalRContext.Provider>
    )
}