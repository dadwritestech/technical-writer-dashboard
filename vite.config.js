import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/technical-writer-dashboard/',
  build: {
    outDir: 'dist',
    sourcemap: false, // Reduce build size
    minify: 'esbuild', // Use default esbuild minifier (faster and included)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'react-hot-toast'],
          data: ['dexie', 'dexie-react-hooks'],
          utils: ['date-fns', 'file-saver', 'uuid']
        }
      }
    }
  },
  server: {
    host: true,
    port: 3000
  }
})