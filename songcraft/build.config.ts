/**
 * Build configuration for Vite manual chunking
 * Separates vendor libraries and large components into separate chunks
 */

export const manualChunks = {
  // Core React libraries - loaded on every page
  'react-vendor': ['react', 'react-dom'],
  
  // TanStack ecosystem - heavy usage throughout app
  'tanstack-vendor': [
    '@tanstack/react-query',
    '@tanstack/react-router',
    '@tanstack/react-table',
    '@tanstack/react-form',
    '@tanstack/react-start',
    '@tanstack/react-virtual',
    '@tanstack/react-store',
    '@tanstack/query-db-collection',
    '@tanstack/react-db',
    '@tanstack/match-sorter-utils',
    '@tanstack/router-plugin'
  ],
  
  // UI component libraries - used across many components
  'ui-vendor': [
    '@radix-ui/react-label',
    '@radix-ui/react-select',
    '@radix-ui/react-slider',
    '@radix-ui/react-slot',
    '@radix-ui/react-switch',
    'lucide-react',
    'react-icons'
  ],
  
  // Utility libraries - small but commonly used
  'utils-vendor': [
    'clsx',
    'tailwind-merge',
    'class-variance-authority',
    'zod'
  ],
  
  // Authentication - Clerk libraries
  'clerk-vendor': [
    '@clerk/clerk-react',
    '@clerk/tanstack-react-start',
    '@clerk/backend'
  ],
  
  // Database and data processing (client-side only)
  'data-vendor': [
    'drizzle-orm',
    '@neondatabase/serverless'
    // Note: drizzle-kit and postgres are server-side only
  ],
  
  // Development and monitoring
  'dev-vendor': [
    '@sentry/tanstackstart-react',
    '@tanstack/react-devtools',
    '@tanstack/react-query-devtools',
    '@tanstack/react-router-devtools',
    '@tanstack/devtools-event-client'
  ],
  
  // tRPC related (if used)
  'trpc-vendor': [
    '@trpc/client',
    '@trpc/react-query',
    '@trpc/server',
    '@trpc/tanstack-react-query'
  ]
};

/**
 * Performance budgets for different chunk types
 */
export const performanceBudgets = {
  // Main app bundle should be kept small
  maxMainBundleSize: 300, // KB
  
  // Vendor chunks can be larger since they're cached longer
  maxVendorChunkSize: 500, // KB
  
  // Route chunks should be small for fast navigation
  maxRouteChunkSize: 100, // KB
  
  // Overall warning limit
  chunkSizeWarningLimit: 1000 // KB
};

/**
 * Function to determine which manual chunk a module should belong to
 * Used as an alternative to the static manualChunks object for more complex logic
 */
export function getManualChunk(id: string): string | undefined {
  // Handle node_modules vendor splitting
  if (id.includes('node_modules')) {
    // Extract package name
    const chunks = id.split('node_modules/')[1].split('/');
    const packageName = chunks[0].startsWith('@') ? `${chunks[0]}/${chunks[1]}` : chunks[0];
    
    // Find which vendor chunk this package belongs to
    for (const [chunkName, packages] of Object.entries(manualChunks)) {
      if (packages.includes(packageName)) {
        return chunkName;
      }
    }
    
    // Default vendor chunk for unspecified packages
    return 'other-vendor';
  }
  
  // Handle source code splitting
  if (id.includes('/src/components/admin/DataTable')) {
    return 'data-table';
  }
  
  // Let other files be handled by default routing
  return undefined;
}