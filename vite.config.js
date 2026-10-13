// File: vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The API runs separately (npm run dev:api); same-origin /api keeps the session cookie first-party.
const apiProxy = { '/api': { target: 'http://127.0.0.1:4000', changeOrigin: false } };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    proxy: apiProxy
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    proxy: apiProxy
  }
});
