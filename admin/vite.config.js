import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Admin panel is built and served by the Node backend at /admin,
// so it lives on the same host as the API (no CORS headaches, one deploy).
export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  build: {
    outDir: '../backend/public/admin',
    emptyOutDir: true
  }
});
