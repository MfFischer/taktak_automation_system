import PouchDB from 'pouchdb';
import { logger } from '../utils/logger';

/**
 * Subscription Service
 * 
 * Manages user subscriptions from LemonSqueezy payments.
 * Stores subscription data in PouchDB for offline-first operation.
 */

export interface Subscription {
  _id: string;
  _rev?: string;
  type: 'subscription';
  userId: string;
  lemonSqueezyId: string;
  orderId: number;
  productName: string;
  variantName: string;
  variantId: number;
  status: 'active' | 'cancelled' | 'expired' | 'on_trial' | 'paused' | 'past_due' | 'unpaid';
  statusFormatted: string;
  customerName: string;
  customerEmail: string;
  price: string;
  renewsAt: string | null;
  endsAt: string | null;
  trialEndsAt: string | null;
  isPaused: boolean;
  isUsageBased: boolean;
  subscriptionItemId: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEvent {
  _id: string;
  _rev?: string;
  type: 'webhook_event';
  eventName: string;
  lemonSqueezyId: string;
  processed: boolean;
  processingError: string | null;
  body: any;
  createdAt: string;
  updatedAt: string;
}

export class SubscriptionService {
  private db: PouchDB.Database;

  constructor() {
    this.db = new PouchDB('subscriptions');
    this.createIndexes().catch((error) => {
      logger.error('Failed to create subscription indexes', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });
  }

  private async createIndexes(): Promise<void> {
    try {
      await this.db.createIndex({
        index: {
          fields: ['type', 'userId', 'status'],
        },
      });
      await this.db.createIndex({
        index: {
          fields: ['type', 'lemonSqueezyId'],
        },
      });
      logger.debug('Subscription indexes created');
    } catch (error) {
      logger.debug('Subscription indexes already exist or failed to create');
    }
  }

  /**
   * Create or update a subscription
   */
  async upsertSubscription(data: Omit<Subscription, '_id' | '_rev' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    try {
      // Check if subscription already exists
      const existing = await this.getSubscriptionByLemonSqueezyId(data.lemonSqueezyId);

      const now = new Date().toISOString();

      if (existing) {
        // Update existing subscription
        const updated: Subscription = {
          ...existing,
          ...data,
          updatedAt: now,
        };

        const result = await this.db.put(updated);
        logger.info('Subscription updated', {
          subscriptionId: updated._id,
          lemonSqueezyId: data.lemonSqueezyId,
          status: data.status,
        });

        return { ...updated, _rev: result.rev };
      } else {
        // Create new subscription
        const subscription: Subscription = {
          _id: `subscription:${data.lemonSqueezyId}`,
          type: 'subscription',
          ...data,
          createdAt: now,
          updatedAt: now,
        };

        const result = await this.db.put(subscription);
        logger.info('Subscription created', {
          subscriptionId: subscription._id,
          lemonSqueezyId: data.lemonSqueezyId,
          userId: data.userId,
        });

        return { ...subscription, _rev: result.rev };
      }
    } catch (error) {
      logger.error('Failed to upsert subscription', {
        error: error instanceof Error ? error.message : 'Unknown error',
        lemonSqueezyId: data.lemonSqueezyId,
      });
      throw error;
    }
  }

  /**
   * Get subscription by LemonSqueezy ID
   */
  async getSubscriptionByLemonSqueezyId(lemonSqueezyId: string): Promise<Subscription | null> {
    try {
      const result = await this.db.find({
        selector: {
          type: 'subscription',
          lemonSqueezyId,
        },
        limit: 1,
      });

      return result.docs.length > 0 ? (result.docs[0] as Subscription) : null;
    } catch (error) {
      logger.error('Failed to get subscription by LemonSqueezy ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        lemonSqueezyId,
      });
      return null;
    }
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const result = await this.db.find({
        selector: {
          type: 'subscription',
          userId,
        },
      });

      return result.docs as Subscription[];
    } catch (error) {
      logger.error('Failed to get user subscriptions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      return [];
    }
  }

  /**
   * Get active subscription for a user
   */
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      const result = await this.db.find({
        selector: {
          type: 'subscription',
          userId,
          status: 'active',
        },
        limit: 1,
      });

      return result.docs.length > 0 ? (result.docs[0] as Subscription) : null;
    } catch (error) {
      logger.error('Failed to get active subscription', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      return null;
    }
  }

  /**
   * Store webhook event
   */
  async storeWebhookEvent(eventName: string, lemonSqueezyId: string, body: any): Promise<WebhookEvent> {
    try {
      const now = new Date().toISOString();
      const event: WebhookEvent = {
        _id: `webhook:${lemonSqueezyId}:${Date.now()}`,
        type: 'webhook_event',
        eventName,
        lemonSqueezyId,
        processed: false,
        processingError: null,
        body,
        createdAt: now,
        updatedAt: now,
      };

      const result = await this.db.put(event);
      logger.info('Webhook event stored', {
        eventId: event._id,
        eventName,
        lemonSqueezyId,
      });

      return { ...event, _rev: result.rev };
    } catch (error) {
      logger.error('Failed to store webhook event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventName,
        lemonSqueezyId,
      });
      throw error;
    }
  }

  /**
   * Mark webhook event as processed
   */
  async markWebhookProcessed(eventId: string, error: string | null = null): Promise<void> {
    try {
      const event = await this.db.get(eventId) as WebhookEvent;
      event.processed = true;
      event.processingError = error;
      event.updatedAt = new Date().toISOString();

      await this.db.put(event);
      logger.info('Webhook event marked as processed', {
        eventId,
        hasError: !!error,
      });
    } catch (error) {
      logger.error('Failed to mark webhook as processed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventId,
      });
    }
  }
}

export const subscriptionService = new SubscriptionService();

