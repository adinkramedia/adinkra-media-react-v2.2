import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure proper asset & routing behavior
  server: {
    watch: {
      // Ignore the Python virtual environment and any node_modules
      ignored: ['**/.venv/**', '**/node_modules/**']
    }
  }
});
