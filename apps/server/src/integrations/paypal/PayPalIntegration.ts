/**
 * PayPal Integration
 * Supports orders, payments, refunds
 */

import { BaseIntegration, AuthCredentials, IntegrationConfig, AuthType } from '../base/BaseIntegration.js';
import { WorkflowNode } from '@taktak/types';

export class PayPalIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'PayPal',
      authType: AuthType.OAUTH2,
      baseUrl: 'https://api-m.paypal.com',
      requiredScopes: [],
    };
    super(config, credentials);
  }

  async execute(node: WorkflowNode, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const { operation } = node.config;

    switch (operation) {
      case 'createOrder':
        return this.createOrder(node.config, context);
      case 'captureOrder':
        return this.captureOrder(node.config, context);
      case 'refundPayment':
        return this.refundPayment(node.config, context);
      default:
        throw new Error(`Unknown PayPal operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    // Test connection by getting access token
    await this.makeRequest('/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.credentials.accessToken}`,
      },
    });
  }

  private async createOrder(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const amount = this.resolveValue(config.amount, context);
    const currency = this.resolveValue(config.currency, context) || 'USD';

    return this.makeRequest('/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount,
          },
        }],
      }),
    });
  }

  private async captureOrder(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const orderId = this.resolveValue(config.orderId, context);

    return this.makeRequest(`/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private async refundPayment(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const captureId = this.resolveValue(config.captureId, context);
    const amount = this.resolveValue(config.amount, context);
    const currency = this.resolveValue(config.currency, context) || 'USD';

    return this.makeRequest(`/v2/payments/captures/${captureId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          currency_code: currency,
          value: amount,
        },
      }),
    });
  }

  private resolveValue(value: unknown, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): unknown {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const key = value.slice(2, -2).trim();
      return context.variables[key] ?? context.input[key] ?? value;
    }
    return value;
  }
}

