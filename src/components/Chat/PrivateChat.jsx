/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
    Box, Paper, Avatar, TextField, IconButton, Typography,
    Badge, CircularProgress, Button
} from '@mui/material'
import { Send, Person, ArrowBack } from '@mui/icons-material'

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const PrivateChat = () => {
    const { userId } = useParams()
    const { user } = useAuth()
    const [otherUser, setOtherUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [pollingInterval, setPollingInterval] = useState(null)
    const messagesEndRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (userId) {
            loadChatData()
            const interval = setInterval(() => {
                fetchMessages()
            }, 2000)
            setPollingInterval(interval)

            return () => {
                if (interval) clearInterval(interval)
            }
        }
    }, [userId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadChatData = async () => {
        try {
            setLoading(true)
            await Promise.all([
                fetchUserData(),
                fetchMessages()
            ])
        } catch (err) {
            console.error('Error cargando chat:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const data = await response.json()
                setOtherUser(data)
            }
        } catch (error) {
            console.error('Error cargando usuario:', error)
        }
    }

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/api/messages/private/${user.id}/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const data = await response.json()
                setMessages(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(data)) {
                        return data
                    }
                    return prev
                })
            }
        } catch (error) {
            console.error('Error cargando mensajes:', error)
        }
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending) return

        setSending(true)
        const messageContent = newMessage.trim()

        try {
            const tempMessage = {
                id: `temp_${Date.now()}`,
                senderId: user.id,
                senderUsername: user.username,
                receiverId: userId,
                content: messageContent,
                createdAt: new Date().toISOString(),
                isTemp: true
            }
            setMessages(prev => [...prev, tempMessage])
            setNewMessage('')

            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/api/messages/private`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    senderId: user.id,
                    receiverId: userId,
                    content: messageContent
                })
            })

            if (response.ok) {
                await fetchMessages()
            } else {
                setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
                const errorData = await response.json()
                alert(errorData.message || 'Error al enviar mensaje. Intenta de nuevo.')
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error)
            setMessages(prev => prev.filter(m => m.id !== `temp_${Date.now()}`))
            alert('Error de conexión. Intenta de nuevo.')
        } finally {
            setSending(false)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!otherUser) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Usuario no encontrado
                </Typography>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/chat')}
                    sx={{ mt: 2 }}
                >
                    Volver a los chats
                </Button>
            </Box>
        )
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            bgcolor: 'background.default'
        }}>
            <Paper sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2
            }}>
                <IconButton onClick={() => navigate('/chat')} sx={{ mr: 1, display: { sm: 'none' } }}>
                    <ArrowBack />
                </IconButton>

                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {otherUser.username.charAt(0).toUpperCase()}
                </Avatar>

                <Box>
                    <Typography variant="h6">{otherUser.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {otherUser.email}
                    </Typography>
                </Box>

                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                    <Badge
                        color={"success"}
                        variant="dot"
                        sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        Conectado
                    </Typography>
                </Box>
            </Paper>

            <Paper sx={{
                flexGrow: 1,
                p: 2,
                mb: 2,
                overflow: 'auto',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {messages.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        textAlign: 'center'
                    }}>
                        <Send sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Inicia una conversación
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Envía tu primer mensaje a {otherUser.username}
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {messages.map((msg) => {
                            const isOwn = msg.senderId === user.id
                            const isTemp = msg.isTemp
                            return (
                                <Box
                                    key={msg.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                        mb: 2,
                                        opacity: isTemp ? 0.7 : 1
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            p: 2,
                                            maxWidth: '70%',
                                            bgcolor: isOwn ? 'primary.main' : 'background.paper',
                                            color: isOwn ? 'primary.contrastText' : 'text.primary',
                                            borderRadius: 2,
                                            position: 'relative',
                                            border: isTemp ? '1px dashed rgba(255,255,255,0.3)' : 'none'
                                        }}
                                    >
                                        {!isOwn && (
                                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.8 }}>
                                                {msg.senderUsername}
                                            </Typography>
                                        )}
                                        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                            {msg.content}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                mt: 0.5,
                                                opacity: 0.7,
                                                textAlign: 'right'
                                            }}
                                        >
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {isTemp && ' • Enviando...'}
                                        </Typography>
                                        {isTemp && (
                                            <CircularProgress
                                                size={12}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4
                                                }}
                                            />
                                        )}
                                    </Paper>
                                </Box>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        variant="outlined"
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                        InputProps={{
                            sx: { borderRadius: 2 }
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        sx={{
                            alignSelf: 'flex-end',
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                        }}
                    >
                        {sending ? <CircularProgress size={24} /> : <Send />}
                    </IconButton>
                </Box>
            </Paper>
        </Box>
    )
}

export default PrivateChat
