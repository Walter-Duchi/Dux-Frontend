/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    TextField,
    Button,
    Paper,
    Container,
    Typography,
    Box,
    Alert,
    Link,
    CircularProgress,
    Divider,
    Chip
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (response.ok) {
                const data = await response.json()
                login(data.user, data.token)
                navigate('/chat')
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Credenciales inválidas' }))
                setError(errorData.message || 'Credenciales inválidas')
            }
        } catch (err) {
            setError('Error de conexión. Verifica que el servidor esté funcionando.')
        } finally {
            setLoading(false)
        }
    }

    const usuariosPrueba = [
        { username: 'admin', password: 'password123', desc: 'Administrador' },
        { username: 'walter', password: 'password123', desc: 'Usuario Walter' },
        { username: 'alejandro', password: 'password123', desc: 'Usuario Alejandro' }
    ]

    const llenarCredenciales = (user, pass) => {
        setUsername(user)
        setPassword(pass)
    }

    return (
        <Container
            maxWidth="xs"
            sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 1, sm: 2 } }}
        >
            <Box sx={{
                mt: { xs: 2, sm: 4, md: 6, lg: 8 },
                mb: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: { xs: 'auto', md: '80vh' },
                width: '100%'
            }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, sm: 3, md: 4 },
                        width: '100%',
                        boxSizing: 'border-box',
                        borderRadius: { xs: 2, sm: 2, md: 2 }
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: { xs: 2, sm: 2.5, md: 3 }
                    }}>
                        <LockOutlinedIcon sx={{
                            fontSize: { xs: 34, sm: 38, md: 42 },
                            color: 'primary.main',
                            mb: { xs: 1.5, sm: 2 }
                        }} />
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                fontWeight: 500,
                                textAlign: 'center',
                                fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.125rem' }
                            }}
                        >
                            DUX Mensajería
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                            Seguro • Simple • Minimalista
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Usuario"
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                            size="small"
                            sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.9rem', sm: '1rem' } } }}
                        />
                        <TextField
                            fullWidth
                            label="Contraseña"
                            type="password"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            size="small"
                            sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.9rem', sm: '1rem' } } }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: { xs: 2.5, sm: 3 },
                                mb: 2,
                                py: { xs: 1.2, sm: 1.4, md: 1.5 },
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={22} /> : 'Iniciar Sesión'}
                        </Button>

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Link
                                type="button" component="button"
                                variant="body2"
                                onClick={() => navigate('/register')}
                                disabled={loading}
                                sx={{ textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                            >
                                ¿No tienes cuenta? Regístrate
                            </Link>
                        </Box>
                    </form>

                    <Divider sx={{ my: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Chip
                            label="Usuarios de prueba"
                            icon={<PeopleAltIcon />}
                            size="small"
                            sx={{ fontSize: { xs: '0.72rem', sm: '0.8rem' } }}
                        />
                    </Divider>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {usuariosPrueba.map((u) => (
                            <Button
                                key={u.username}
                                variant="outlined"
                                size="small"
                                onClick={() => llenarCredenciales(u.username, u.password)}
                                sx={{
                                    justifyContent: { xs: 'center', sm: 'space-between' },
                                    textTransform: 'none',
                                    flexWrap: 'wrap',
                                    gap: 0.5,
                                    py: { xs: 1, sm: 0.8 },
                                    px: { xs: 1, sm: 2 },
                                    fontSize: { xs: '0.78rem', sm: '0.85rem' }
                                }}
                            >
                                <span style={{ textAlign: 'left' }}>
                                    <strong>{u.username}</strong> ({u.desc})
                                </span>
                                <Chip
                                    label="password123"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: { xs: '0.68rem', sm: '0.75rem' } }}
                                />
                            </Button>
                        ))}
                    </Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', textAlign: 'center', mt: 2, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                        Haz clic en cualquier usuario para rellenar sus credenciales
                    </Typography>
                </Paper>
            </Box>
        </Container>
    )
}

export default Login
