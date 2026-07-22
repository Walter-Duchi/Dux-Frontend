import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Redirige las peticiones de la API
            '/api': {
                target: 'https://dux.somee.com',
                changeOrigin: true,
                secure: false
            },
            // Redirige las peticiones de SignalR (WebSockets)
            '/chatHub': {
                target: 'https://dux.somee.com',
                ws: true, // Habilita el soporte para WebSockets
                changeOrigin: true,
                secure: false
            }
        }
    }
})