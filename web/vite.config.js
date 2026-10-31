import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  // En desarrollo, Vite le pasa /api a la API, como nginx en producción.
  server: { proxy: { '/api': process.env.API_URL ?? 'http://localhost:3000' } },
});
