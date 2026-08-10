import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Dev'da /api so'rovlarini Vercel serverless funksiyaga yo'naltirish.
    // Prod'da bu kerak emas — vercel.json'dagi rewrite ishlaydi.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  plugins: [react(), tailwindcss()],
  build: {
    // Yirik fayl (27 til ma'lumotlari + firebase) chunk ogohlantirishini oshiramiz
    chunkSizeWarningLimit: 900,
  },
})
