import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // Remove or comment out the setupFiles line
    // setupFiles: './src/test/setup.ts',
  },
})
