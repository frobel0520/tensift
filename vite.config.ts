import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
      '@shared': resolve(projectRoot, 'shared'),
    },
  },
  server: {
    open: '/app/index.html',
    fs: {
      allow: [projectRoot],
    },
  },
  build: {
    outDir: resolve(projectRoot, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(projectRoot, 'app/index.html'),
    },
  },
});
