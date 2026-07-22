/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
    Box, List, ListItem, ListItemText, ListItemIcon,
    Avatar, Typography, Divider, Badge
} from '@mui/material'
import { Group, Person } from '@mui/icons-material'
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
        onItemClick()
    }

    const handleGroupClick = (groupId) => {
        navigate(`/chat/group/${groupId}`)
        onItemClick()
    }

    return (
        <Box sx={{ overflow: 'auto' }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Chats Privados</Typography>
                <List>
                    {users.map(u => (
                        <ListItem
                            key={u.id}
                            button
                            onClick={() => handleUserClick(u.id)}
                        >
                            <ListItemIcon>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    {u.username.charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText primary={u.username} />
                            {u.isActive && <Badge color="success" variant="dot" sx={{ ml: 2 }} />}
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Grupos</Typography>
                    <CreateGroupDialog onGroupCreated={fetchGroups} />
                </Box>

                <List>
                    {groups.map(g => (
                        <ListItem
                            key={g.id}
                            button
                            onClick={() => handleGroupClick(g.id)}
                        >
                            <ListItemIcon>
                                <Group />
                            </ListItemIcon>
                            <ListItemText primary={g.groupName} secondary={g.description} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    )
}

export default ChatSidebar
