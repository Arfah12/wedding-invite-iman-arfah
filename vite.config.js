import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // supaya boleh diakses luar localhost
    port: 5173, // optional, ikut port dev server awak
    allowedHosts: [
      'uncondolatory-unsymbolically-emmett.ngrok-free.dev'
    ]
  }
});
