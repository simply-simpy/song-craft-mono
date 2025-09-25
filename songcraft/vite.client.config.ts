import { defineConfig } from "vite";

export const clientConfig = defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          // TanStack libraries
          'tanstack-vendor': [
            '@tanstack/react-query',
            '@tanstack/react-router', 
            '@tanstack/react-table',
            '@tanstack/react-form'
          ],
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            'lucide-react'
          ],
          // Utility libraries
          'utils-vendor': [
            'clsx',
            'tailwind-merge',
            'zod'
          ],
          // Authentication
          'clerk-vendor': [
            '@clerk/clerk-react',
            '@clerk/tanstack-react-start'
          ]
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000
  }
});