import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Keep '/' if deploying at root
  build: {
    outDir: 'dist', // Default, ensures Netlify picks up the right folder
  },
  server: {
    watch: {
      ignored: ['**/.venv/**', '**/node_modules/**']
    }
  }
});
