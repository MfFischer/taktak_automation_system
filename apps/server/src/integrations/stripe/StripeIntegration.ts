/**
 * Stripe Integration
 * Supports payments, subscriptions, and customer management
 */

import { WorkflowNode } from '@taktak/types';
import { BaseIntegration, AuthType, IntegrationConfig, AuthCredentials } from '../base/BaseIntegration';
import { logger } from '../../utils/logger';

export class StripeIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'Stripe',
      authType: AuthType.API_KEY,
      baseUrl: 'https://api.stripe.com/v1',
    };
    super(config, credentials);
  }

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { operation } = node.config;

    logger.info('Executing Stripe operation', { operation });

    switch (operation) {
      case 'createCustomer':
        return this.createCustomer(node.config);

      case 'getCustomer':
        return this.getCustomer(node.config.customerId as string);

      case 'createPaymentIntent':
        return this.createPaymentIntent(node.config);

      case 'createSubscription':
        return this.createSubscription(node.config);

      case 'cancelSubscription':
        return this.cancelSubscription(node.config.subscriptionId as string);

      case 'listCharges':
        return this.listCharges(node.config);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    await this.makeRequest('/balance', { method: 'GET' });
  }

  /**
   * Create a customer
   */
  private async createCustomer(params: any): Promise<any> {
    const { email, name, description, metadata } = params;

    const body = new URLSearchParams();
    if (email) body.append('email', email);
    if (name) body.append('name', name);
    if (description) body.append('description', description);
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        body.append(`metadata[${key}]`, value as string);
      });
    }

    const response = await this.makeRequest('/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    return {
      customerId: response.id,
      email: response.email,
      name: response.name,
      created: response.created,
    };
  }

  /**
   * Get customer details
   */
  private async getCustomer(customerId: string): Promise<any> {
    const response = await this.makeRequest(`/customers/${customerId}`, {
      method: 'GET',
    });

    return {
      customerId: response.id,
      email: response.email,
      name: response.name,
      balance: response.balance,
      currency: response.currency,
      created: response.created,
    };
  }

  /**
   * Create a payment intent
   */
  private async createPaymentIntent(params: any): Promise<any> {
    const { amount, currency = 'usd', customer, description, metadata } = params;

    const body = new URLSearchParams();
    body.append('amount', amount.toString());
    body.append('currency', currency);
    if (customer) body.append('customer', customer);
    if (description) body.append('description', description);
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        body.append(`metadata[${key}]`, value as string);
      });
    }

    const response = await this.makeRequest('/payment_intents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    return {
      paymentIntentId: response.id,
      clientSecret: response.client_secret,
      amount: response.amount,
      currency: response.currency,
      status: response.status,
    };
  }

  /**
   * Create a subscription
   */
  private async createSubscription(params: any): Promise<any> {
    const { customer, priceId, trialDays } = params;

    const body = new URLSearchParams();
    body.append('customer', customer);
    body.append('items[0][price]', priceId);
    if (trialDays) body.append('trial_period_days', trialDays.toString());

    const response = await this.makeRequest('/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    return {
      subscriptionId: response.id,
      status: response.status,
      currentPeriodEnd: response.current_period_end,
    };
  }

  /**
   * Cancel a subscription
   */
  private async cancelSubscription(subscriptionId: string): Promise<any> {
    const response = await this.makeRequest(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });

    return {
      subscriptionId: response.id,
      status: response.status,
      canceledAt: response.canceled_at,
    };
  }

  /**
   * List charges
   */
  private async listCharges(params: any): Promise<any> {
    const { limit = 10, customer } = params;
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (customer) queryParams.append('customer', customer);

    const response = await this.makeRequest(`/charges?${queryParams.toString()}`, {
      method: 'GET',
    });

    return {
      charges: response.data.map((charge: any) => ({
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        created: charge.created,
      })),
      hasMore: response.has_more,
    };
  }
}

