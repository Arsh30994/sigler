import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The reviewed export is the single source served verbatim to the viewer.
  publicDir: resolve(__dirname, 'assets/ax1/exports'),
  // Keep the build independent of unrelated machine-level PostCSS settings.
  css: { postcss: { plugins: [] } },
})
