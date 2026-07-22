/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
    Box, Paper, Avatar, TextField, IconButton, Typography,
    Badge, CircularProgress, Button
} from '@mui/material'
import { Send, Group, ArrowBack } from '@mui/icons-material'
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const GroupChat = () => {
    const { groupId } = useParams()
    const { user } = useAuth()
    const [group, setGroup] = useState(null)
    const [messages, setMessages] = useState([])
    const [members, setMembers] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [pollingInterval, setPollingInterval] = useState(null)
    const messagesEndRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (groupId) {
            loadGroupData()
            const interval = setInterval(() => {
                fetchGroupMessages()
            }, 2000)
            setPollingInterval(interval)

            return () => {
                if (interval) clearInterval(interval)
            }
        }
    }, [groupId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadGroupData = async () => {
        try {
            setLoading(true)
            await Promise.all([
                fetchGroupInfo(),
                fetchGroupMessages(),
                fetchGroupMembers()
            ])
        } catch (err) {
            console.error('Error cargando grupo:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchGroupInfo = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const data = await response.json()
                setGroup(data)
            }
        } catch (error) {
            console.error('Error cargando grupo:', error)
        }
    }

    const fetchGroupMessages = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/api/messages/group/${groupId}`, {
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

    const fetchGroupMembers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const data = await response.json()
                setMembers(data)
            }
        } catch (error) {
            console.error('Error cargando miembros:', error)
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
                groupId: parseInt(groupId),
                content: messageContent,
                createdAt: new Date().toISOString(),
                isTemp: true
            }
            setMessages(prev => [...prev, tempMessage])
            setNewMessage('')

            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/api/messages/group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    senderId: user.id,
                    groupId: groupId,
                    content: messageContent
                })
            })

            if (response.ok) {
                await fetchGroupMessages()
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

    if (!group) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Group sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Grupo no encontrado
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
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <IconButton onClick={() => navigate('/chat')} sx={{ mr: 1, display: { sm: 'none' } }}>
                        <ArrowBack />
                    </IconButton>

                    <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                        <Group />
                    </Avatar>

                    <Box>
                        <Typography variant="h6">{group.groupName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {group.description || 'Sin descripción'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Creado por {group.createdByUsername} • {members.length} miembros
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                        <Group sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No hay mensajes aún
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Inicia la conversación en {group.groupName}
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
                                        mb: 2,
                                        opacity: isTemp ? 0.7 : 1
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: 'block',
                                            ml: isOwn ? 'auto' : 0,
                                            mr: isOwn ? 0 : 'auto',
                                            width: 'fit-content',
                                            mb: 0.5
                                        }}
                                    >
                                        {msg.senderUsername}
                                        {isOwn && ' (Tú)'}
                                    </Typography>

                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: isOwn ? 'flex-end' : 'flex-start'
                                    }}>
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
                        placeholder={`Mensaje ${group.groupName}`}
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

export default GroupChat
