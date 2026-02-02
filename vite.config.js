import { defineConfig, loadEnv } from 'vite' // Import loadEnv
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiUrl = env.VITE_API_BASE_URL || 'http://127.0.0.1:8080';

    return {
        plugins: [
            react({
                babel: {
                    plugins: [['babel-plugin-react-compiler']],
                },
            }),
            tailwindcss(),
            basicSsl()
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
                    target: apiUrl, // Uses the .env value
                    changeOrigin: true,
                    secure: false,
                },
                '/auth': {
                    target: apiUrl,
                    changeOrigin: true,
                    secure: false,
                },
                '/ws': {
                    target: apiUrl,
                    ws: true, 
                    changeOrigin: true,
                    secure: false,
                },
            }
        }
    }
})