/**
 * Client environment configuration
 * Centralizes all environment variables
 */

export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',

  // Feature Flags
  features: {
    aiEnabled: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
    cloudSyncEnabled: import.meta.env.VITE_ENABLE_CLOUD_SYNC === 'true',
    analyticsEnabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },

  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  environment: import.meta.env.VITE_ENV || 'development',
} as const;

export default config;

