import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // 이 한 줄만 있으면 내부 IP 접근 가능
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
})
