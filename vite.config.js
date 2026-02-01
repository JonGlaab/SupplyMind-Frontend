import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler']],
            },
        }),
        tailwindcss(),
        basicSsl() // Allows HTTPS on localhost
    ],
    define: {
        global: 'window',
    },
    server: {
        host: true,
        port: 5173,
        https: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080',
                changeOrigin: true,
                secure: false,
            },
            '/auth': {
                target: 'http://127.0.0.1:8080',
                changeOrigin: true,
                secure: false,
            },
            // ADD THIS SECTION FOR THE WEBSOCKET
            '/ws': {
                target: 'http://127.0.0.1:8080',
                ws: true,
                changeOrigin: true,
                secure: false,
            },
        }
    }
})