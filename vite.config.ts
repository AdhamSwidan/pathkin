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
      // This makes the Vercel environment variable available as process.env.API_KEY
      // to satisfy the strict coding guideline for the Gemini SDK.
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    }
  }
})