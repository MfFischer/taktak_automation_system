/**
 * Twilio Integration
 * Supports SMS, calls, WhatsApp
 */

import { BaseIntegration, AuthCredentials, IntegrationConfig, AuthType } from '../base/BaseIntegration.js';
import { WorkflowNode } from '@taktak/types';

export class TwilioIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'Twilio',
      authType: AuthType.BASIC,
      baseUrl: `https://api.twilio.com/2010-04-01/Accounts/${credentials.username}`,
      requiredScopes: [],
    };
    super(config, credentials);
  }

  async execute(node: WorkflowNode, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const { operation } = node.config;

    switch (operation) {
      case 'sendSMS':
        return this.sendSMS(node.config, context);
      case 'makeCall':
        return this.makeCall(node.config, context);
      case 'sendWhatsApp':
        return this.sendWhatsApp(node.config, context);
      default:
        throw new Error(`Unknown Twilio operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    // Test connection by getting account info
    const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
    await this.makeRequest('.json', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
  }

  private async sendSMS(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const to = this.resolveValue(config.to, context);
    const from = this.resolveValue(config.from, context);
    const body = this.resolveValue(config.body, context);

    const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
    const params = new URLSearchParams({
      To: to as string,
      From: from as string,
      Body: body as string,
    });

    return this.makeRequest('/Messages.json', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
  }

  private async makeCall(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const to = this.resolveValue(config.to, context);
    const from = this.resolveValue(config.from, context);
    const url = this.resolveValue(config.url, context);

    const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
    const params = new URLSearchParams({
      To: to as string,
      From: from as string,
      Url: url as string,
    });

    return this.makeRequest('/Calls.json', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
  }

  private async sendWhatsApp(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const to = this.resolveValue(config.to, context);
    const from = this.resolveValue(config.from, context);
    const body = this.resolveValue(config.body, context);

    const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
    const params = new URLSearchParams({
      To: `whatsapp:${to}`,
      From: `whatsapp:${from}`,
      Body: body as string,
    });

    return this.makeRequest('/Messages.json', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
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

