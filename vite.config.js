import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// /api/roy runs on Vercel in production; on this laptop, `node tools/roy-dev.mjs` serves it on port 8787
const api = { '/api': 'http://localhost:8787' }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: api },
  preview: { proxy: api },
})
