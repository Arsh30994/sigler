import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Do not inherit the unrelated machine-level PostCSS configuration.
  // Tailwind remains installed for the planned utility migration, but the
  // current CSS has no utility directives to compile.
  css: { postcss: { plugins: [] } },
})
