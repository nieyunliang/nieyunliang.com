import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteCompression()],
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://170.106.152.19',
        rewrite: path => path.replace('/api', '')
      }
    }
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
  }
})
