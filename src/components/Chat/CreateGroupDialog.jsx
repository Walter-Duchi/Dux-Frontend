/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Alert, Typography, Paper, List,
    ListItem, ListItemIcon, ListItemText, Checkbox, IconButton,
    CircularProgress, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
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
    const theme = useTheme()
    const pantallaCompleta = useMediaQuery(theme.breakpoints.down('sm'))

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
            <IconButton onClick={() => setOpen(true)} size="small" sx={{ p: { xs: 0.5, sm: 0.75 } }}>
                <Add fontSize="small" />
            </IconButton>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={pantallaCompleta}
            >
                <DialogTitle sx={{
                    fontSize: { xs: '1.05rem', sm: '1.15rem', md: '1.25rem' },
                    px: { xs: 2, sm: 2.5, md: 3 },
                    py: { xs: 1.5, sm: 2 }
                }}>
                    Crear nuevo grupo
                </DialogTitle>
                <DialogContent sx={{ px: { xs: 2, sm: 2.5, md: 3 } }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre del grupo *"
                        fullWidth
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        disabled={loading}
                        size="small"
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
                        size="small"
                        sx={{ mb: 2 }}
                    />

                    <Typography variant="subtitle1" sx={{
                        mt: 2,
                        mb: 1,
                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }
                    }}>
                        Seleccionar miembros (opcional)
                    </Typography>
                    <Paper sx={{ maxHeight: { xs: '40vh', sm: '35vh', md: 220 }, overflow: 'auto' }}>
                        <List sx={{ py: 0 }}>
                            {availableUsers.map(u => (
                                <ListItem
                                    key={u.id}
                                    dense
                                    onClick={() => handleUserToggle(u.id)}
                                    sx={{ cursor: 'pointer', px: { xs: 1, sm: 1.5 } }}
                                >
                                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedUsers.includes(u.id)}
                                            tabIndex={-1}
                                            disableRipple
                                            size="small"
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={u.username}
                                        secondary={u.email}
                                        primaryTypographyProps={{
                                            noWrap: true,
                                            fontSize: { xs: '0.85rem', sm: '0.9rem' }
                                        }}
                                        secondaryTypographyProps={{
                                            noWrap: true,
                                            fontSize: { xs: '0.72rem', sm: '0.78rem' }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                        Seleccionados: {selectedUsers.length} usuarios
                    </Typography>
                </DialogContent>
                <DialogActions sx={{
                    px: { xs: 2, sm: 2.5, md: 3 },
                    pb: { xs: 2, sm: 2 },
                    gap: 1,
                    flexWrap: 'wrap'
                }}>
                    <Button onClick={() => setOpen(false)} disabled={loading} size="small">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        disabled={loading || !groupName.trim()}
                        size="small"
                    >
                        {loading ? <CircularProgress size={20} /> : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default CreateGroupDialog
