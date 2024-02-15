// vite.config.js

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@comp': fileURLToPath(new URL('./src/components', import.meta.url))
    }
  }
})

/*
  
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(pathSegments, "src"),
    },
  },
});*/