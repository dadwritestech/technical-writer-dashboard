import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/technical-writer-dashboard/',
  build: {
    outDir: 'dist',
    sourcemap: false, // Reduce build size
    minify: 'terser',
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
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  server: {
    host: true,
    port: 3000
  }
})