import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Set the base path for correct asset loading on custom domains
  plugins: [react()],
})