/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
    Box, List, ListItem, ListItemText, ListItemIcon,
    Avatar, Typography, Divider, Badge, ListItemButton
} from '@mui/material'
import { Group } from '@mui/icons-material'
import CreateGroupDialog from './CreateGroupDialog'

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const ChatSidebar = ({ onItemClick }) => {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [groups, setGroups] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            loadData()
        }
    }, [user])

    const loadData = async () => {
        await Promise.all([
            fetchUsers(),
            fetchGroups()
        ])
    }

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const data = await response.json()
                setUsers(data.filter(u => u.id !== user.id))
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error)
        }
    }

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/api/groups/user/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const data = await response.json()
                setGroups(data)
            }
        } catch (error) {
            console.error('Error cargando grupos:', error)
        }
    }

    const handleUserClick = (userId) => {
        navigate(`/chat/private/${userId}`)
        if (onItemClick) onItemClick()
    }

    const handleGroupClick = (groupId) => {
        navigate(`/chat/group/${groupId}`)
        if (onItemClick) onItemClick()
    }

    return (
        <Box sx={{ overflow: 'auto', width: '100%', height: '100%' }}>
            <Box sx={{ p: { xs: 1.5, sm: 1.75, md: 2 } }}>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.08rem', md: '1.15rem' } }}
                >
                    Chats Privados
                </Typography>
                <List sx={{ py: 0 }}>
                    {users.map(u => (
                        <ListItem key={u.id} disablePadding>
                            <ListItemButton
                                onClick={() => handleUserClick(u.id)}
                                sx={{
                                    borderRadius: 1,
                                    py: { xs: 0.75, sm: 0.9, md: 1 },
                                    px: { xs: 1, sm: 1.5, md: 2 }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: { xs: 38, sm: 46, md: 56 } }}>
                                    <Avatar sx={{
                                        width: { xs: 28, sm: 30, md: 32 },
                                        height: { xs: 28, sm: 30, md: 32 },
                                        bgcolor: 'primary.main',
                                        fontSize: { xs: '0.8rem', sm: '0.85rem', md: '1rem' }
                                    }}>
                                        {u.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary={u.username}
                                    primaryTypographyProps={{
                                        noWrap: true,
                                        fontSize: { xs: '0.88rem', sm: '0.94rem', md: '1rem' }
                                    }}
                                />
                                {u.isActive && <Badge color="success" variant="dot" sx={{ ml: 1 }} />}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: { xs: 1.5, sm: 1.75, md: 2 } }} />

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: { xs: 1.5, sm: 1.75, md: 2 }
                }}>
                    <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: '1rem', sm: '1.08rem', md: '1.15rem' } }}
                    >
                        Grupos
                    </Typography>
                    <CreateGroupDialog onGroupCreated={fetchGroups} />
                </Box>

                <List sx={{ py: 0 }}>
                    {groups.map(g => (
                        <ListItem key={g.id} disablePadding>
                            <ListItemButton
                                onClick={() => handleGroupClick(g.id)}
                                sx={{
                                    borderRadius: 1,
                                    py: { xs: 0.75, sm: 0.9, md: 1 },
                                    px: { xs: 1, sm: 1.5, md: 2 }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: { xs: 38, sm: 46, md: 56 } }}>
                                    <Group fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={g.groupName}
                                    secondary={g.description}
                                    primaryTypographyProps={{
                                        noWrap: true,
                                        fontSize: { xs: '0.88rem', sm: '0.94rem', md: '1rem' }
                                    }}
                                    secondaryTypographyProps={{
                                        noWrap: true,
                                        fontSize: { xs: '0.72rem', sm: '0.78rem', md: '0.85rem' }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    )
}

export default ChatSidebar
