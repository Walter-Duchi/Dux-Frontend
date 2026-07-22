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
        <Container maxWidth="xs">
            <Box sx={{
                mt: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '80vh'
            }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <LockOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 500 }}>
                            DUX Mensajería
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
                        </Button>

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Link
                                type="button" component="button"
                                variant="body2"
                                onClick={() => navigate('/register')}
                                disabled={loading}
                            >
                                ¿No tienes cuenta? Regístrate
                            </Link>
                        </Box>
                    </form>

                    <Divider sx={{ my: 3 }}>
                        <Chip label="Usuarios de prueba" icon={<PeopleAltIcon />} />
                    </Divider>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {usuariosPrueba.map((u) => (
                            <Button
                                key={u.username}
                                variant="outlined"
                                size="small"
                                onClick={() => llenarCredenciales(u.username, u.password)}
                                sx={{ justifyContent: 'space-between', textTransform: 'none' }}
                            >
                                <span><strong>{u.username}</strong> ({u.desc})</span>
                                <Chip label="password123" size="small" variant="outlined" sx={{ ml: 1 }} />
                            </Button>
                        ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                        Haz clic en cualquier usuario para rellenar sus credenciales
                    </Typography>
                </Paper>
            </Box>
        </Container>
    )
}

export default Login
