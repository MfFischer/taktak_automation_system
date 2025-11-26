/**
 * Telegram Integration
 * Supports messages, photos, documents, locations
 */

import { BaseIntegration, AuthCredentials, IntegrationConfig, AuthType } from '../base/BaseIntegration.js';
import { WorkflowNode } from '@taktak/types';

export class TelegramIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'Telegram',
      authType: AuthType.API_KEY,
      baseUrl: `https://api.telegram.org/bot${credentials.apiKey}`,
      requiredScopes: [],
    };
    super(config, credentials);
  }

  async execute(node: WorkflowNode, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const { operation } = node.config;

    switch (operation) {
      case 'sendMessage':
        return this.sendMessage(node.config, context);
      case 'sendPhoto':
        return this.sendPhoto(node.config, context);
      case 'sendDocument':
        return this.sendDocument(node.config, context);
      case 'sendLocation':
        return this.sendLocation(node.config, context);
      default:
        throw new Error(`Unknown Telegram operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    // Test connection by getting bot info
    await this.makeRequest('/getMe', {
      method: 'GET',
    });
  }

  private async sendMessage(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const chatId = this.resolveValue(config.chatId, context);
    const text = this.resolveValue(config.text, context);
    const parseMode = config.parseMode || 'HTML';

    return this.makeRequest('/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
  }

  private async sendPhoto(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const chatId = this.resolveValue(config.chatId, context);
    const photo = this.resolveValue(config.photo, context);
    const caption = this.resolveValue(config.caption, context);

    return this.makeRequest('/sendPhoto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo,
        caption,
      }),
    });
  }

  private async sendDocument(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const chatId = this.resolveValue(config.chatId, context);
    const document = this.resolveValue(config.document, context);
    const caption = this.resolveValue(config.caption, context);

    return this.makeRequest('/sendDocument', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        document,
        caption,
      }),
    });
  }

  private async sendLocation(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const chatId = this.resolveValue(config.chatId, context);
    const latitude = this.resolveValue(config.latitude, context);
    const longitude = this.resolveValue(config.longitude, context);

    return this.makeRequest('/sendLocation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        latitude,
        longitude,
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

