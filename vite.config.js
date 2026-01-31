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
        host: true,   // Allows your mobile device to find the server
        port: 5173,
        https: true,  // Required for the barcode scanner/camera to work
        proxy: {
            // Redirects any call starting with /api to your Spring Boot backend
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})