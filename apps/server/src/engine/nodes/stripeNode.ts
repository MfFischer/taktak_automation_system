/**
 * Stripe Payment Integration Node
 * Process payments, manage customers, and handle subscriptions
 */

import axios from 'axios';
import { WorkflowNode } from '@taktak/types';
import { BaseNodeHandler } from './sdk/NodeSDK';

interface NodeContext {
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
}

export interface StripeNodeConfig {
  action: 'create_payment_intent' | 'create_customer' | 'create_subscription' | 'refund_payment' | 'get_payment';
  apiKey: string;
  amount?: number;
  currency?: string;
  customerId?: string;
  email?: string;
  name?: string;
  paymentIntentId?: string;
  priceId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export class StripeNodeHandler extends BaseNodeHandler {
  private readonly STRIPE_API_BASE = 'https://api.stripe.com/v1';

  async execute(node: WorkflowNode, context: NodeContext): Promise<unknown> {
    const config = node.config as unknown as StripeNodeConfig;

    // Validate required fields
    this.validateRequired(config, ['action', 'apiKey']);

    // Resolve expressions
    const resolvedConfig: StripeNodeConfig = {
      ...config,
      email: config.email ? this.resolveExpression(config.email as string, context) as string : undefined,
      name: config.name ? this.resolveExpression(config.name as string, context) as string : undefined,
      customerId: config.customerId ? this.resolveExpression(config.customerId as string, context) as string : undefined,
      description: config.description ? this.resolveExpression(config.description as string, context) as string : undefined,
    };

    switch (config.action) {
      case 'create_payment_intent':
        return await this.createPaymentIntent(resolvedConfig);
      case 'create_customer':
        return await this.createCustomer(resolvedConfig);
      case 'create_subscription':
        return await this.createSubscription(resolvedConfig);
      case 'refund_payment':
        return await this.refundPayment(resolvedConfig);
      case 'get_payment':
        return await this.getPayment(resolvedConfig);
      default:
        throw new Error(`Unknown action: ${config.action}`);
    }
  }

  private async createPaymentIntent(config: StripeNodeConfig): Promise<unknown> {
    this.validateRequired(config, ['amount', 'currency']);

    const response = await axios.post(
      `${this.STRIPE_API_BASE}/payment_intents`,
      new URLSearchParams({
        amount: config.amount!.toString(),
        currency: config.currency!,
        ...(config.customerId && { customer: config.customerId }),
        ...(config.description && { description: config.description }),
        ...(config.metadata && this.flattenMetadata(config.metadata)),
      }),
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      paymentIntentId: response.data.id,
      clientSecret: response.data.client_secret,
      amount: response.data.amount,
      currency: response.data.currency,
      status: response.data.status,
    };
  }

  private async createCustomer(config: StripeNodeConfig): Promise<unknown> {
    const params: Record<string, string> = {};
    
    if (config.email) params.email = config.email;
    if (config.name) params.name = config.name;
    if (config.description) params.description = config.description;
    if (config.metadata) Object.assign(params, this.flattenMetadata(config.metadata));

    const response = await axios.post(
      `${this.STRIPE_API_BASE}/customers`,
      new URLSearchParams(params),
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      customerId: response.data.id,
      email: response.data.email,
      name: response.data.name,
    };
  }

  private async createSubscription(config: StripeNodeConfig): Promise<unknown> {
    this.validateRequired(config, ['customerId', 'priceId']);

    const response = await axios.post(
      `${this.STRIPE_API_BASE}/subscriptions`,
      new URLSearchParams({
        customer: config.customerId!,
        'items[0][price]': config.priceId!,
        ...(config.metadata && this.flattenMetadata(config.metadata)),
      }),
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      subscriptionId: response.data.id,
      status: response.data.status,
      currentPeriodEnd: response.data.current_period_end,
    };
  }

  private async refundPayment(config: StripeNodeConfig): Promise<unknown> {
    this.validateRequired(config, ['paymentIntentId']);

    const response = await axios.post(
      `${this.STRIPE_API_BASE}/refunds`,
      new URLSearchParams({
        payment_intent: config.paymentIntentId!,
        ...(config.amount && { amount: config.amount.toString() }),
      }),
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      refundId: response.data.id,
      amount: response.data.amount,
      status: response.data.status,
    };
  }

  private async getPayment(config: StripeNodeConfig): Promise<unknown> {
    this.validateRequired(config, ['paymentIntentId']);

    const response = await axios.get(
      `${this.STRIPE_API_BASE}/payment_intents/${config.paymentIntentId}`,
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      paymentIntentId: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency,
      status: response.data.status,
      customer: response.data.customer,
    };
  }

  private getHeaders(config: StripeNodeConfig): Record<string, string> {
    return {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  private flattenMetadata(metadata: Record<string, string>): Record<string, string> {
    const flattened: Record<string, string> = {};
    Object.entries(metadata).forEach(([key, value]) => {
      flattened[`metadata[${key}]`] = value;
    });
    return flattened;
  }
}

