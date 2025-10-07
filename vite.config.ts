import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    // This instructs Vite to replace any occurrence of `process.env.API_KEY`
    // in the code with the value of the `VITE_GEMINI_API_KEY` environment variable
    // at build time. This is the crucial step to make the API key available
    // in the browser while keeping the source code compliant.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
  }
})
