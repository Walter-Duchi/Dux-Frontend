import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import Login from './components/Login'
import Register from './components/Register'
import ChatComponent from './components/Chat/ChatComponent'
import { AuthProvider } from './contexts/AuthContext'
import { SignalRProvider } from './contexts/SignalRContext'

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
        background: { default: '#0a1929', paper: '#132f4c' }
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontSize: '2.125rem',
            '@media (max-width:900px)': { fontSize: '1.85rem' },
            '@media (max-width:600px)': { fontSize: '1.55rem' }
        },
        h5: {
            fontSize: '1.5rem',
            '@media (max-width:600px)': { fontSize: '1.2rem' }
        },
        h6: {
            fontSize: '1.25rem',
            '@media (max-width:900px)': { fontSize: '1.12rem' },
            '@media (max-width:600px)': { fontSize: '1rem' }
        },
        body1: {
            '@media (max-width:600px)': { fontSize: '0.925rem' }
        },
        body2: {
            '@media (max-width:600px)': { fontSize: '0.825rem' }
        },
        button: {
            '@media (max-width:600px)': { fontSize: '0.85rem' }
        }
    },
    shape: { borderRadius: 8 },
    breakpoints: {
        values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }
    },
    components: {
        MuiDialog: {
            styleOverrides: {
                paper: {
                    '@media (max-width:600px)': { margin: 8, width: 'calc(100% - 16px)' }
                }
            }
        }
    }
})

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <AuthProvider>
                    <SignalRProvider>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/chat/*" element={<ChatComponent />} />
                            <Route path="/" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </SignalRProvider>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
