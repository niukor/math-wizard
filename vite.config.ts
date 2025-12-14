import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 设置为 true 或 "0.0.0.0" 以监听所有本地 IP
    host: true, 
  }
})