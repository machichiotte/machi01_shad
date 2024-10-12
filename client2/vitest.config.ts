// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom', // ou 'node' selon vos besoins
    include: ['tests/**/*.spec.ts'], // Chemin vers vos fichiers de test
  },
}); 