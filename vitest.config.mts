import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Node environment on purpose: the suite covers store business rules only.
    // No DOM testing, no component rendering — see README trade-offs.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
