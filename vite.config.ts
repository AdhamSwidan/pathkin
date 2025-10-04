import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Fix: Replaced `process.cwd()` with `'./'` to resolve a TypeScript type error.
  const env = loadEnv(mode, './', '');
  return {
    plugins: [react()],
    define: {
      // This makes environment variables available on the client-side `process.env` object.
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
    }
  }
})