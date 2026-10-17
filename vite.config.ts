/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // The puzzle archive rarely changes, so keep it in its own file that browsers can keep cached.
        codeSplitting: { groups: [{ name: 'puzzles', test: /src[\\/]data[\\/]/ }] },
      },
    },
    chunkSizeWarningLimit: 400,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
