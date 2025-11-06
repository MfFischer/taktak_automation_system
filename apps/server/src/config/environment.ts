/**
 * Environment configuration
 * Validates and exports environment variables with type safety
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Validates that required environment variables are set
 */
function validateEnv(): void {
  const required = ['NODE_ENV', 'SERVER_PORT'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateEnv();

export const config = {
  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server configuration
  server: {
    port: parseInt(process.env.SERVER_PORT || '3001', 10),
    host: process.env.SERVER_HOST || 'localhost',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  },

  // Client configuration
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000',
  },

  // CouchDB configuration
  couchdb: {
    url: process.env.COUCHDB_URL || 'http://localhost:5984',
    user: process.env.COUCHDB_USER || 'admin',
    password: process.env.COUCHDB_PASSWORD || 'changeme',
    database: process.env.COUCHDB_DATABASE || 'taktak_workflows',
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
    encryptionKey: process.env.ENCRYPTION_KEY || 'change-this-32-char-key-prod!!',
    sessionSecret: process.env.SESSION_SECRET || 'change-this-session-secret',
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Feature flags
  features: {
    cloudSync: process.env.ENABLE_CLOUD_SYNC === 'true',
    aiFeatures: process.env.ENABLE_AI_FEATURES === 'true',
    analytics: process.env.ENABLE_ANALYTICS === 'true',
  },

  // Worker configuration
  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
    maxRetries: parseInt(process.env.WORKER_MAX_RETRIES || '3', 10),
  },

  // Data retention
  retention: {
    logDays: parseInt(process.env.LOG_RETENTION_DAYS || '30', 10),
    workflowHistoryDays: parseInt(process.env.WORKFLOW_HISTORY_RETENTION_DAYS || '90', 10),
  },

  // External services (optional - users provide via UI)
  services: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  },
} as const;

/**
 * Validates configuration at startup
 */
export function validateConfig(): void {
  // Warn about insecure defaults in production
  if (config.isProduction) {
    if (config.security.jwtSecret === 'change-this-in-production') {
      console.warn('WARNING: Using default JWT secret in production!');
    }
    if (config.security.encryptionKey === 'change-this-32-char-key-prod!!') {
      console.warn('WARNING: Using default encryption key in production!');
    }
  }

  // Validate encryption key length
  if (config.security.encryptionKey.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
  }
}

export default config;

