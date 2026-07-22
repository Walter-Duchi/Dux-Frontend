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
    typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
    shape: { borderRadius: 8 }
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