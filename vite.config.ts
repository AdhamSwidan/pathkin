import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
    plugins: [react()],
    define: {
      // This is a more robust way to inject the key.
      // It avoids conflicts with 'process' polyfills and works directly with Vite's environment mechanism.
      'import.meta.env.GEMINI_API_KEY_INJECTED': JSON.stringify(env.VITE_GEMINI_API_KEY),
    }
  }
})
