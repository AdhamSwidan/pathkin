import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fix: Define process.env.API_KEY for client-side access as required by Gemini API guidelines.
  // This makes the environment variable available during build, replacing process.env.API_KEY
  // with its stringified value.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
})
