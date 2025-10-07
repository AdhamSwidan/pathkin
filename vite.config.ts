import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This is a more robust way to ensure environment variables are loaded during build.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
    plugins: [react()],
    define: {
      // This will replace `process.env.API_KEY` with the actual key string during the build.
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    }
  }
})
