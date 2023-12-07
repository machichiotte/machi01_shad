const { defineConfig } = require('@vue/cli-service')

const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: 'dist',
  assetsDir: 'static',
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'vue$': 'vue/dist/vue.esm-bundler.js'
      }
    }
  },
})