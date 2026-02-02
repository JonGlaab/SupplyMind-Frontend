import { defineConfig, loadEnv } from 'vite' // Import loadEnv
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const rawUrl = env.VITE_API_BASE_URL || 'http://127.0.0.1:8080';
    const frontendPort = parseInt(env.PORT) || 5173;

    const targetRoot = rawUrl.replace(/\/api\/?$/, '');

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
            port: frontendPort,
            https: true,
            proxy: {
                '/api': {
                    target: targetRoot,
                    changeOrigin: true,
                    secure: false,
                },
                '/auth': {
                    target: targetRoot,
                    changeOrigin: true,
                    secure: false,
                },
                '/ws': {
                    target: targetRoot,
                    ws: true, 
                    changeOrigin: true,
                    secure: false,
                },
            }
        }
    }
})