// vite.config.js

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'vite-plugin-csp-nonce',
      transformIndexHtml(html) {
        const nonce = btoa(Math.random().toString()).substring(0, 16) // Générer un nonce
        return html.replace(
          /<meta http-equiv="Content-Security-Policy" content="(.*?)">/,
          (match, p1) => {
            return `<meta http-equiv="Content-Security-Policy" content="${p1}; style-src 'self' 'nonce-${nonce}';">`
          }
        )
      },
      handleHotUpdate({ file, server }) {
        // Injecter le nonce dans les styles lors de la mise à jour à chaud
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
    outDir: 'dist', // Correspond à outputDir de Vue CLI
    assetsDir: 'static' // Correspond à assetsDir de Vue CLI
  }
})
