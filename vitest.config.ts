import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  // GLTFLoader/Three modules are stable in isolated Node processes on Windows;
  // worker threads can otherwise leave the test runner waiting at shutdown.
  test: { environment: 'jsdom', setupFiles: ['./tests/unit/setup.ts'], include: ['tests/unit/**/*.test.{ts,tsx}'], pool: 'forks' },
})
