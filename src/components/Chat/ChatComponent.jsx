import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSignalR } from '../../contexts/SignalRContext'
import {
    Box, Drawer, AppBar, Toolbar, IconButton, Typography,
    Badge, Avatar, Menu, MenuItem, Alert, useMediaQuery
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
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
    const theme = useTheme()
    const esMovil = useMediaQuery(theme.breakpoints.down('md'))

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/login')
        }
    }, [isAuthenticated, user, navigate])

    useEffect(() => {
        if (!esMovil && mobileOpen) {
            setMobileOpen(false)
        }
    }, [esMovil, mobileOpen])

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

    const anchoDrawer = 280

    return (
        <Box sx={{
            display: 'flex',
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            '@supports (height: 100dvh)': { height: '100dvh' }
        }}>
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar sx={{ minHeight: { xs: 56, sm: 60, md: 64 }, px: { xs: 1, sm: 1.5, md: 2 } }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: { xs: 0.5, sm: 1, md: 2 },
                            display: { xs: 'inline-flex', md: 'none' },
                            p: { xs: 0.5, sm: 1 }
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        DUX Chat
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                        <Badge
                            color={isConnected ? "error" : "success"}
                            variant="dot"
                            sx={{ mr: { xs: 0.5, sm: 1 } }}
                        >
                            <Typography
                                variant="caption"
                                sx={{ display: { xs: 'none', sm: 'inline' }, fontSize: '0.75rem' }}
                            >
                                {isConnected ? 'Desconectado' : 'Conectado'}
                            </Typography>
                        </Badge>

                        <IconButton
                            color="inherit"
                            onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                            size="small"
                            sx={{ p: { xs: 0.5, sm: 0.75 } }}
                        >
                            <Avatar sx={{
                                width: { xs: 26, sm: 30, md: 32 },
                                height: { xs: 26, sm: 30, md: 32 },
                                bgcolor: 'secondary.main',
                                fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' }
                            }}>
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
                    display: { xs: 'none', md: 'block' },
                    width: anchoDrawer,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: anchoDrawer,
                        boxSizing: 'border-box',
                        top: { md: '64px' },
                        height: { md: 'calc(100% - 64px)' }
                    }
                }}
                open
            >
                <ChatSidebar onItemClick={() => setMobileOpen(false)} />
            </Drawer>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: { xs: 'min(85vw, 300px)', sm: 'min(60vw, 320px)' },
                        maxWidth: 340,
                        boxSizing: 'border-box',
                        top: { xs: '56px', sm: '60px' },
                        height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 60px)' }
                    }
                }}
            >
                <ChatSidebar onItemClick={() => setMobileOpen(false)} />
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 0.75, sm: 1.5, md: 2, lg: 3 },
                    mt: { xs: '56px', sm: '60px', md: '64px' },
                    height: {
                        xs: 'calc(100vh - 56px)',
                        sm: 'calc(100vh - 60px)',
                        md: 'calc(100vh - 64px)'
                    },
                    '@supports (height: 100dvh)': {
                        height: {
                            xs: 'calc(100dvh - 56px)',
                            sm: 'calc(100dvh - 60px)',
                            md: 'calc(100dvh - 64px)'
                        }
                    },
                    overflow: 'hidden',
                    width: '100%',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ flexGrow: 1, overflow: 'hidden', minHeight: 0, width: '100%' }}>
                    <Routes>
                        <Route path="/" element={
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                textAlign: 'center',
                                px: 2
                            }}>
                                <Typography
                                    variant="h5"
                                    color="text.secondary"
                                    gutterBottom
                                    sx={{ fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' } }}
                                >
                                    Bienvenido a DUX Chat
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}
                                >
                                    Selecciona una conversación o crea un grupo para empezar a chatear
                                </Typography>
                            </Box>
                        } />
                        <Route path="/private/:userId" element={<PrivateChat />} />
                        <Route path="/group/:groupId" element={<GroupChat />} />
                    </Routes>
                </Box>
            </Box>
        </Box>
    )
}

export default ChatComponent
