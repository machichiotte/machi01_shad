// vite.config.ts

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'vite-plugin-csp-nonce',
      transformIndexHtml(html) {
        const nonce = btoa(Math.random().toString()).substring(0, 16) // Generate a nonce
        return html.replace(
          /<meta http-equiv="Content-Security-Policy" content="(.*?)">/,
          (match, p1) => {
            return `<meta http-equiv="Content-Security-Policy" content="${p1}; style-src 'self' 'nonce-${nonce}';">`
          }
        )
      },
      handleHotUpdate({ file, server }) {
        // Inject the nonce into styles during hot update
        const nonce = btoa(Math.random().toString()).substring(0, 16)
        server.ws.send({
          type: 'custom',
          event: 'vite:nonce',
          data: nonce
        })
      }
    }
  ],
  root: '.',
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@comp': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@btn': fileURLToPath(new URL('./src/components/buttons', import.meta.url)),
      '@form': fileURLToPath(new URL('./src/components/forms', import.meta.url)),
      vue$: 'vue/dist/vue.esm-bundler.js'
    }
  },
  build: {
    outDir: 'dist', // Corresponds to outputDir of Vue CLI
    assetsDir: 'static' // Corresponds to assetsDir of Vue CLI
  }
})
