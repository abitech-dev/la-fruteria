import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  // En desarrollo, la API llega por la vitrina que levanta Compose.
  server: { proxy: { '/api': 'http://127.0.0.1:8080' } },
  test: { environment: 'jsdom' },
});
