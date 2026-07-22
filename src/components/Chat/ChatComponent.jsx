import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSignalR } from '../../contexts/SignalRContext'
import {
    Box, Drawer, AppBar, Toolbar, IconButton, Typography,
    Badge, Avatar, Menu, MenuItem, Alert
} from '@mui/material'
import {
    Menu as MenuIcon,
    Logout
} from '@mui/icons-material'
import ChatSidebar from './ChatSidebar'
import PrivateChat from './PrivateChat'
import GroupChat from './GroupChat'

const ChatComponent = () => {
    const { user, logout, isAuthenticated } = useAuth()
    const { isConnected } = useSignalR()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [userMenuAnchor, setUserMenuAnchor] = useState(null)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/login')
        }
    }, [isAuthenticated, user, navigate])

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        DUX Chat
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Badge
                            color={isConnected ? "error" : "success"}
                            variant="dot"
                            sx={{ mr: 1 }}
                        >
                            <Typography variant="caption">
                                {isConnected ? 'Desconectado' : 'Conectado'}
                            </Typography>
                        </Badge>

                        <IconButton color="inherit" onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                {user.username.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu
                        anchorEl={userMenuAnchor}
                        open={Boolean(userMenuAnchor)}
                        onClose={() => setUserMenuAnchor(null)}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                                {user.username}
                            </Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Logout sx={{ mr: 1 }} /> Cerrar sesión
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: 280,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 280,
                        boxSizing: 'border-box',
                        mt: '64px'
                    }
                }}
            >
                <ChatSidebar onItemClick={() => setMobileOpen(false)} />
            </Drawer>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        width: 280,
                        mt: '64px'
                    }
                }}
            >
                <ChatSidebar onItemClick={() => setMobileOpen(false)} />
            </Drawer>

            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                mt: '64px',
                height: 'calc(100vh - 64px)',
                overflow: 'hidden'
            }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Routes>
                    <Route path="/" element={
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            textAlign: 'center'
                        }}>
                            <Typography variant="h5" color="text.secondary" gutterBottom>
                                Bienvenido a DUX Chat
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Selecciona una conversación o crea un grupo para empezar a chatear
                            </Typography>
                        </Box>
                    } />
                    <Route path="/private/:userId" element={<PrivateChat />} />
                    <Route path="/group/:groupId" element={<GroupChat />} />
                </Routes>
            </Box>
        </Box>
    )
}

export default ChatComponent
