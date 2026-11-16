import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^core-js\/.*$/,
        replacement: path.resolve(__dirname, 'src/utils/empty.ts'),
      },
      {
        find: 'core-js',
        replacement: path.resolve(__dirname, 'src/utils/empty.ts'),
      },
    ],
  },
  server: {
    port: 3000,
    open: false,
  },
});
