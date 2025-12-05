import { defineConfig } from 'vitest/config'

export default
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom', // ou 'node' selon vos besoins
      include: ['tests/**/*.spec.ts'],
    }
  });