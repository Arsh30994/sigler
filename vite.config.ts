import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  // The reviewed export is the single source served verbatim to the viewer.
  publicDir: resolve(__dirname, 'assets/ax1/exports'),
  // Do not inherit the unrelated machine-level PostCSS configuration.
  // Tailwind remains installed for the planned utility migration, but the
  // current CSS has no utility directives to compile.
  css: { postcss: { plugins: [] } },
})
