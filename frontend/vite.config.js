import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import UnoCSS from 'unocss/vite'


export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: "0.0.0.0",
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@tanstack/vue-query', 'vue-toastification'],
        }
      }
    }
  }
})