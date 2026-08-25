import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import cesium from 'vite-plugin-cesium-build'

export default defineConfig({
  plugins: [react(), tailwindcss(), cesium()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/ws':  { target: 'ws://127.0.0.1:8001',   ws: true, changeOrigin: true },
    }
  }
})
