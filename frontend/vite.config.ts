import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        global: 'window',
    },
    plugins: [react()],
    preview: {
        port: 3000,
        strictPort: true,
        host: "http://0.0.0.0:3000",
    },
    server: {
        port: 3000,
        strictPort: true,
        host: true,
        origin: "http://0.0.0.0:3000",
    },
});
