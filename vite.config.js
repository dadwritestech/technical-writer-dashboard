import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/techwriter-dashboard/',
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})