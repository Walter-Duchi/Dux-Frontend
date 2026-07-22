/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Alert, Typography, Paper, List,
    ListItem, ListItemIcon, ListItemText, Checkbox, IconButton,
    CircularProgress
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const CreateGroupDialog = ({ onGroupCreated }) => {
    const [open, setOpen] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [description, setDescription] = useState('')
    const [selectedUsers, setSelectedUsers] = useState([])
    const [availableUsers, setAvailableUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { user } = useAuth()

    useEffect(() => {
        if (open) {
            fetchAvailableUsers()
        }
    }, [open])

    const fetchAvailableUsers = async () => {
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
                setAvailableUsers(data.filter(u => u.id !== user.id))
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error)
        }
    }

    const handleCreate = async () => {
        if (!groupName.trim()) {
            setError('El nombre del grupo es obligatorio')
            return
        }

        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/api/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    groupName: groupName.trim(),
                    description: description.trim() || null,
                    memberIds: selectedUsers
                })
            })

            if (response.ok) {
                setOpen(false)
                setGroupName('')
                setDescription('')
                setSelectedUsers([])
                onGroupCreated()
            } else {
                const errorData = await response.json()
                setError(errorData.message || 'Error al crear el grupo')
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const handleUserToggle = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    return (
        <>
            <IconButton onClick={() => setOpen(true)}>
                <Add />
            </IconButton>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Crear nuevo grupo</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre del grupo *"
                        fullWidth
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        disabled={loading}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Descripción"
                        fullWidth
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                        sx={{ mb: 2 }}
                    />

                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Seleccionar miembros (opcional)
                    </Typography>
                    <Paper sx={{ maxHeight: 200, overflow: 'auto' }}>
                        <List>
                            {availableUsers.map(u => (
                                <ListItem key={u.id} dense button onClick={() => handleUserToggle(u.id)}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedUsers.includes(u.id)}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={u.username}
                                        secondary={u.email}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Seleccionados: {selectedUsers.length} usuarios
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        disabled={loading || !groupName.trim()}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default CreateGroupDialog
