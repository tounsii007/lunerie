import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'cmdk', 'sonner', 'vaul', 'embla-carousel-react', 'react-intersection-observer'],
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // Split heavy long-cached vendor bundles out of the per-deploy entry
    // chunk so the user keeps the cached copy across releases. Naming groups
    // is intentional: each gets its own filename hash and HTTP/2 lane.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('@tanstack/react-query')) return 'vendor-query';
          if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-leaflet';
          if (id.includes('/zod/')) return 'vendor-validation';
          if (id.includes('cmdk') || id.includes('sonner') || id.includes('vaul')) return 'vendor-ui';
          if (id.includes('react-dom') || id.match(/[\\/]react[\\/]/)) return 'vendor-react';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
    css: true,
  },
});
