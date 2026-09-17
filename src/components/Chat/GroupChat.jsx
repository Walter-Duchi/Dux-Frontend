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
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                px: 2
            }}>
                <Group sx={{ fontSize: { xs: 56, sm: 68, md: 80 }, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                    Grupo no encontrado
                </Typography>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/chat')}
                    sx={{ mt: 2 }}
                    size="small"
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
            width: '100%',
            bgcolor: 'background.default',
            minHeight: 0,
            overflow: 'hidden'
        }}>
            <Paper sx={{
                p: { xs: 1, sm: 1.25, md: 1.75, lg: 2 },
                mb: { xs: 0.75, sm: 1, md: 1.5, lg: 2 },
                borderRadius: { xs: 1.5, sm: 2 },
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 0.75, md: 1 },
                flexShrink: 0
            }}>
                <IconButton
                    onClick={() => navigate('/chat')}
                    sx={{ display: { xs: 'inline-flex', md: 'none' }, p: { xs: 0.5, sm: 0.75 } }}
                    size="small"
                >
                    <ArrowBack fontSize="small" />
                </IconButton>

                <Avatar sx={{
                    mr: { xs: 0.75, sm: 1, md: 1.5, lg: 2 },
                    bgcolor: 'secondary.main',
                    width: { xs: 32, sm: 36, md: 40 },
                    height: { xs: 32, sm: 36, md: 40 },
                    flexShrink: 0
                }}>
                    <Group fontSize="small" />
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.15rem', lg: '1.25rem' } }}
                    >
                        {group.groupName}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            fontSize: { sm: '0.75rem', md: '0.85rem' }
                        }}
                    >
                        {group.description || 'Sin descripción'}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{
                            display: 'block',
                            fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                        }}
                    >
                        {members.length} miembros
                    </Typography>
                </Box>

                <Box sx={{
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <Badge color={"success"} variant="dot" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { sm: '0.72rem', md: '0.78rem' } }}>
                        Conectado
                    </Typography>
                </Box>
            </Paper>

            <Paper sx={{
                flexGrow: 1,
                p: { xs: 1, sm: 1.25, md: 1.75, lg: 2 },
                mb: { xs: 0.75, sm: 1, md: 1.5, lg: 2 },
                overflow: 'auto',
                borderRadius: { xs: 1.5, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
            }}>
                {messages.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        textAlign: 'center',
                        px: 2
                    }}>
                        <Group sx={{ fontSize: { xs: 42, sm: 52, md: 60 }, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
                            No hay mensajes aún
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.78rem', sm: '0.83rem', md: '0.875rem' } }}>
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
                                        mb: { xs: 0.75, sm: 1, md: 1.5, lg: 2 },
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
                                            mb: 0.5,
                                            fontSize: { xs: '0.62rem', sm: '0.68rem', md: '0.75rem' }
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
                                                p: { xs: 1, sm: 1.25, md: 1.75, lg: 2 },
                                                maxWidth: { xs: '88%', sm: '82%', md: '75%', lg: '70%' },
                                                bgcolor: isOwn ? 'primary.main' : 'background.paper',
                                                color: isOwn ? 'primary.contrastText' : 'text.primary',
                                                borderRadius: { xs: 1.5, sm: 2 },
                                                position: 'relative',
                                                border: isTemp ? '1px dashed rgba(255,255,255,0.3)' : 'none',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    wordBreak: 'break-word',
                                                    fontSize: { xs: '0.88rem', sm: '0.93rem', md: '1rem' }
                                                }}
                                            >
                                                {msg.content}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    mt: 0.5,
                                                    opacity: 0.7,
                                                    textAlign: 'right',
                                                    fontSize: { xs: '0.62rem', sm: '0.68rem', md: '0.75rem' }
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

            <Paper sx={{
                p: { xs: 0.75, sm: 1, md: 1.5, lg: 2 },
                borderRadius: { xs: 1.5, sm: 2 },
                flexShrink: 0
            }}>
                <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 0.75, md: 1 }, alignItems: 'flex-end' }}>
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
                        size="small"
                        InputProps={{
                            sx: {
                                borderRadius: 2,
                                fontSize: { xs: '0.88rem', sm: '0.93rem', md: '1rem' }
                            }
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        sx={{
                            flexShrink: 0,
                            width: { xs: 40, sm: 42, md: 46 },
                            height: { xs: 40, sm: 42, md: 46 },
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                        }}
                    >
                        {sending ? <CircularProgress size={20} /> : <Send fontSize="small" />}
                    </IconButton>
                </Box>
            </Paper>
        </Box>
    )
}

export default GroupChat
