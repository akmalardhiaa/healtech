import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// di GitHub Pages situsnya ada di /healtech/, bukan root.
// VITE_BASE diset lewat workflow, jadi dev lokal tetap jalan di /
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },
  },
  server: { host: true, port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion', 'gsap'],
        },
      },
    },
  },
})
