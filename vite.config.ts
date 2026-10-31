import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' にしておくと GitHub Pages などのサブパスにそのまま置ける
export default defineConfig({
  base: './',
  plugins: [react()],
});
