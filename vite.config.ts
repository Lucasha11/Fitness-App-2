import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // The app itself, and the design system it is built from. The system
        // is a wide documentation page, so it gets its own entry rather than
        // living inside the app's 390x844 phone shell.
        main: resolve(__dirname, 'index.html'),
        'design-system': resolve(__dirname, 'design-system.html'),
      },
    },
  },
})
