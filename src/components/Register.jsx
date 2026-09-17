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
    CircularProgress
} from '@mui/material'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            })

            if (response.ok) {
                const data = await response.json()
                login(data.user, data.token)
                navigate('/chat')
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Error en el registro' }))
                setError(errorData.message || 'Error en el registro')
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
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
                        <PersonAddOutlinedIcon sx={{
                            fontSize: { xs: 34, sm: 38, md: 42 },
                            color: 'primary.main',
                            mb: { xs: 1.5, sm: 2 }
                        }} />
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                textAlign: 'center',
                                fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.125rem' }
                            }}
                        >
                            Crear Cuenta
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
                            label="Correo electrónico"
                            type="email"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        <TextField
                            fullWidth
                            label="Confirmar Contraseña"
                            type="password"
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {loading ? <CircularProgress size={22} /> : 'Registrarse'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link
                                type="button" component="button"
                                variant="body2"
                                onClick={() => navigate('/login')}
                                disabled={loading}
                                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                            >
                                ¿Ya tienes cuenta? Inicia sesión
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    )
}

export default Register
