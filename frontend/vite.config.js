import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // tudo que bater em /auth e /tickets será enviado ao back
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/tickets': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    }
  }
});
