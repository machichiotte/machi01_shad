// vite.config.js

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@comp': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@btn': fileURLToPath(new URL('./src/components/buttons', import.meta.url)),
      '@form': fileURLToPath(new URL('./src/components/forms', import.meta.url)),
    }
  }
})