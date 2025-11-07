import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { logger } from '../utils/logger';

/**
 * LemonSqueezy Configuration
 * 
 * This module sets up and validates the LemonSqueezy SDK configuration.
 * It ensures all required environment variables are present and initializes
 * the SDK for use throughout the application.
 */

interface LemonSqueezyConfig {
  apiKey: string;
  storeId: string;
  webhookSecret: string;
  webhookUrl: string;
  desktopVariantId: string;
  cloudSyncVariantId: string;
}

/**
 * Get LemonSqueezy configuration from environment variables
 */
export function getLemonSqueezyConfig(): LemonSqueezyConfig {
  const requiredEnvVars = [
    'LEMONSQUEEZY_API_KEY',
    'LEMONSQUEEZY_STORE_ID',
    'LEMONSQUEEZY_WEBHOOK_SECRET',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required LemonSqueezy environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    storeId: process.env.LEMONSQUEEZY_STORE_ID!,
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
    webhookUrl: process.env.LEMONSQUEEZY_WEBHOOK_URL || '',
    desktopVariantId: process.env.LEMONSQUEEZY_DESKTOP_VARIANT_ID || '',
    cloudSyncVariantId: process.env.LEMONSQUEEZY_CLOUD_SYNC_VARIANT_ID || '',
  };
}

/**
 * Initialize LemonSqueezy SDK
 * 
 * This function validates the configuration and sets up the LemonSqueezy SDK.
 * It should be called once during application startup.
 */
export function configureLemonSqueezy(): void {
  try {
    const config = getLemonSqueezyConfig();

    // Initialize the LemonSqueezy SDK
    lemonSqueezySetup({
      apiKey: config.apiKey,
      onError: (error) => {
        logger.error('LemonSqueezy API Error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      },
    });

    logger.info('LemonSqueezy SDK configured successfully', {
      storeId: config.storeId,
      hasWebhookUrl: !!config.webhookUrl,
      hasDesktopVariant: !!config.desktopVariantId,
      hasCloudSyncVariant: !!config.cloudSyncVariantId,
    });
  } catch (error) {
    logger.error('Failed to configure LemonSqueezy SDK', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Check if LemonSqueezy is properly configured
 */
export function isLemonSqueezyConfigured(): boolean {
  try {
    getLemonSqueezyConfig();
    return true;
  } catch {
    return false;
  }
}

