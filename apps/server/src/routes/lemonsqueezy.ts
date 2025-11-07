import express, { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { configureLemonSqueezy, getLemonSqueezyConfig } from '../config/lemonsqueezy';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { subscriptionService } from '../services/subscriptionService';
import { LicenseService } from '../services/licenseService';
import { logger } from '../utils/logger';

const licenseService = new LicenseService();

const router = Router();

/**
 * POST /api/lemonsqueezy/checkout
 * 
 * Create a checkout session for a product variant
 * 
 * Body:
 * - variantId: string (required) - LemonSqueezy variant ID
 * - productType: 'desktop' | 'cloud_sync' (required)
 * - embed: boolean (optional) - Whether to use embedded checkout
 */
router.post(
  '/checkout',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { variantId, productType, embed = false } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!variantId) {
      return res.status(400).json({
        success: false,
        error: 'variantId is required',
      });
    }

    if (!productType || !['desktop', 'cloud_sync'].includes(productType)) {
      return res.status(400).json({
        success: false,
        error: 'productType must be either "desktop" or "cloud_sync"',
      });
    }

    try {
      // Configure LemonSqueezy SDK
      configureLemonSqueezy();
      const config = getLemonSqueezyConfig();

      // Create checkout session
      const checkout = await createCheckout(
        config.storeId,
        variantId,
        {
          checkoutOptions: {
            embed,
            media: true,
            logo: true,
            desc: true,
            discount: true,
            dark: false,
            subscriptionPreview: true,
          },
          checkoutData: {
            email: user.email || undefined,
            name: user.name || undefined,
            custom: {
              user_id: user.id,
              product_type: productType,
            },
          },
          productOptions: {
            enabledVariants: [variantId],
            redirectUrl: `${process.env.CLIENT_URL}/app/dashboard?checkout=success`,
            receiptButtonText: 'Go to Dashboard',
            receiptThankYouNote: 'Thank you for your purchase! Your license will be delivered shortly.',
          },
        }
      );

      if (!checkout.data) {
        throw new Error('Failed to create checkout session');
      }

      logger.info('Checkout session created', {
        userId: user.id,
        variantId,
        productType,
        checkoutId: checkout.data.id,
      });

      return res.json({
        success: true,
        data: {
          checkoutUrl: checkout.data.attributes.url,
          checkoutId: checkout.data.id,
        },
      });
    } catch (error) {
      logger.error('Failed to create checkout session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id,
        variantId,
        productType,
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

/**
 * GET /api/lemonsqueezy/products
 * 
 * Get available products and pricing
 */
router.get(
  '/products',
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      const config = getLemonSqueezyConfig();

      const products = [
        {
          id: 'desktop',
          name: 'Taktak Desktop',
          description: 'One-time purchase for desktop application with offline-first capabilities',
          price: '$29',
          priceAmount: 2900,
          currency: 'USD',
          type: 'one-time',
          variantId: config.desktopVariantId,
          features: [
            'Offline-first workflow automation',
            'Visual workflow builder',
            'Local AI with Phi-3',
            '18 pre-built templates',
            'Unlimited workflows',
            'SMS & Email nodes',
            'Database integration',
            'Lifetime updates',
          ],
          popular: true,
        },
        {
          id: 'cloud_sync',
          name: 'Taktak Cloud Sync',
          description: 'Monthly subscription for cloud backup and multi-device sync',
          price: '$5-9/month',
          priceAmount: 500,
          currency: 'USD',
          type: 'subscription',
          variantId: config.cloudSyncVariantId,
          features: [
            'Everything in Desktop',
            'Cloud backup & sync',
            'Multi-device access',
            'Team collaboration',
            'Priority support',
            'Advanced analytics',
            'Custom integrations',
            'White-label options',
          ],
          popular: false,
        },
      ];

      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error('Failed to get products', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to get products',
      });
    }
  })
);

/**
 * POST /api/lemonsqueezy/webhook
 *
 * Webhook endpoint for LemonSqueezy events
 * This endpoint processes payment events and updates subscriptions
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const config = getLemonSqueezyConfig();

      // Verify webhook signature
      const signature = req.headers['x-signature'] as string;
      if (!signature) {
        logger.warn('Webhook received without signature');
        return res.status(401).json({
          success: false,
          error: 'Missing signature',
        });
      }

      // Get raw body for signature verification
      const rawBody = req.body.toString('utf8');
      const hmac = crypto.createHmac('sha256', config.webhookSecret);
      const digest = hmac.update(rawBody).digest('hex');

      if (signature !== digest) {
        logger.warn('Webhook signature verification failed');
        return res.status(401).json({
          success: false,
          error: 'Invalid signature',
        });
      }

      // Parse the webhook payload
      const payload = JSON.parse(rawBody);
      const eventName = payload.meta?.event_name;
      const eventData = payload.data;

      if (!eventName || !eventData) {
        logger.warn('Invalid webhook payload', { payload });
        return res.status(400).json({
          success: false,
          error: 'Invalid payload',
        });
      }

      // Store webhook event
      await subscriptionService.storeWebhookEvent(
        eventName,
        eventData.id,
        payload
      );

      logger.info('Webhook event received', {
        eventName,
        eventId: eventData.id,
      });

      // Process the webhook event asynchronously
      processWebhookEvent(eventName, eventData, payload).catch((error) => {
        logger.error('Failed to process webhook event', {
          error: error instanceof Error ? error.message : 'Unknown error',
          eventName,
          eventId: eventData.id,
        });
      });

      // Return 200 immediately to acknowledge receipt
      return res.json({
        success: true,
        message: 'Webhook received',
      });
    } catch (error) {
      logger.error('Webhook processing error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return res.status(500).json({
        success: false,
        error: 'Webhook processing failed',
      });
    }
  })
);

/**
 * Process webhook event asynchronously
 */
async function processWebhookEvent(
  eventName: string,
  eventData: any,
  payload: any
): Promise<void> {
  try {
    const customData = payload.meta?.custom_data || {};

    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(eventData, customData);
        break;

      case 'subscription_created':
      case 'subscription_updated':
        await handleSubscriptionEvent(eventData, customData);
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(eventData);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(eventData, customData);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(eventData);
        break;

      default:
        logger.info('Unhandled webhook event', { eventName });
    }

    // Mark webhook as processed
    await subscriptionService.markWebhookProcessed(`webhook:${eventData.id}:*`);
  } catch (error) {
    logger.error('Failed to process webhook event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      eventName,
      eventId: eventData.id,
    });

    // Mark webhook as processed with error
    await subscriptionService.markWebhookProcessed(
      `webhook:${eventData.id}:*`,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Handle order created event (one-time purchases like Desktop license)
 */
async function handleOrderCreated(eventData: any, customData: any): Promise<void> {
  const attributes = eventData.attributes;
  const userId = customData.user_id;
  const productType = customData.product_type;

  if (!userId) {
    logger.warn('Order created without user_id', { orderId: eventData.id });
    return;
  }

  logger.info('Processing order created', {
    orderId: eventData.id,
    userId,
    productType,
    status: attributes.status,
  });

  // If it's a desktop license purchase, generate and deliver license key
  if (productType === 'desktop' && attributes.status === 'paid') {
    try {
      const license = await licenseService.createLicense({
        tier: 'desktop' as any,
        email: attributes.user_email,
        metadata: {
          orderId: eventData.id,
          purchaseDate: attributes.created_at,
        },
      });

      logger.info('Desktop license created for order', {
        orderId: eventData.id,
        userId,
        licenseKey: license.licenseKey,
      });

      // TODO: Send license key via email
      // await emailService.sendLicenseKey(attributes.user_email, license.licenseKey);
    } catch (error) {
      logger.error('Failed to create license for order', {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId: eventData.id,
        userId,
      });
    }
  }
}

/**
 * Handle subscription created/updated event
 */
async function handleSubscriptionEvent(eventData: any, customData: any): Promise<void> {
  const attributes = eventData.attributes;
  const userId = customData.user_id;

  if (!userId) {
    logger.warn('Subscription event without user_id', { subscriptionId: eventData.id });
    return;
  }

  logger.info('Processing subscription event', {
    subscriptionId: eventData.id,
    userId,
    status: attributes.status,
  });

  // Upsert subscription in database
  await subscriptionService.upsertSubscription({
    userId,
    lemonSqueezyId: eventData.id,
    orderId: attributes.order_id,
    productName: attributes.product_name,
    variantName: attributes.variant_name,
    variantId: attributes.variant_id,
    status: attributes.status,
    statusFormatted: attributes.status_formatted,
    customerName: attributes.user_name,
    customerEmail: attributes.user_email,
    price: `$${(attributes.subtotal / 100).toFixed(2)}`,
    renewsAt: attributes.renews_at,
    endsAt: attributes.ends_at,
    trialEndsAt: attributes.trial_ends_at,
    isPaused: attributes.pause !== null,
    isUsageBased: attributes.first_subscription_item?.is_usage_based || false,
    subscriptionItemId: attributes.first_subscription_item?.id || 0,
  });

  // If subscription is active, create/update license
  if (attributes.status === 'active') {
    try {
      const license = await licenseService.createLicense({
        tier: 'cloud_sync' as any,
        email: attributes.user_email,
        metadata: {
          orderId: attributes.order_id,
          purchaseDate: attributes.created_at,
        },
      });

      logger.info('Cloud sync license created for subscription', {
        subscriptionId: eventData.id,
        userId,
        licenseKey: license.licenseKey,
      });
    } catch (error) {
      logger.error('Failed to create license for subscription', {
        error: error instanceof Error ? error.message : 'Unknown error',
        subscriptionId: eventData.id,
        userId,
      });
    }
  }
}

/**
 * Handle subscription cancelled/expired event
 */
async function handleSubscriptionCancelled(eventData: any): Promise<void> {
  const attributes = eventData.attributes;

  logger.info('Processing subscription cancellation', {
    subscriptionId: eventData.id,
    status: attributes.status,
  });

  // Get subscription from database
  const subscription = await subscriptionService.getSubscriptionByLemonSqueezyId(eventData.id);

  if (subscription) {
    // Update subscription status
    await subscriptionService.upsertSubscription({
      ...subscription,
      status: attributes.status,
      statusFormatted: attributes.status_formatted,
      endsAt: attributes.ends_at,
    });

    // TODO: Deactivate license or downgrade user
    logger.info('Subscription cancelled', {
      subscriptionId: eventData.id,
      userId: subscription.userId,
    });
  }
}

/**
 * Handle payment success event
 */
async function handlePaymentSuccess(eventData: any, customData: any): Promise<void> {
  logger.info('Payment successful', {
    subscriptionId: eventData.id,
    userId: customData.user_id,
  });

  // Subscription will be updated via subscription_updated event
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(eventData: any): Promise<void> {
  const attributes = eventData.attributes;

  logger.warn('Payment failed', {
    subscriptionId: eventData.id,
    status: attributes.status,
  });

  // TODO: Send payment failed notification to user
}

export default router;

