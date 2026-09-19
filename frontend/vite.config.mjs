import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // proxy API requests to the backend to avoid CORS and ensure correct host
    proxy: {
      // all API paths start with a verb or sensible prefix
      '/predict-text': 'http://localhost:8000',
      '/predict-image': 'http://localhost:8000',
      '/login': 'http://localhost:8000',
      '/register': 'http://localhost:8000',
      '/predictions': 'http://localhost:8000',
    },
  },
})
