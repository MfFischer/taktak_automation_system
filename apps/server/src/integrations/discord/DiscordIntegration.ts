/**
 * Discord Integration
 * Supports bot messages, webhooks, channels, roles
 */

import { BaseIntegration, AuthCredentials, IntegrationConfig, AuthType } from '../base/BaseIntegration.js';
import { WorkflowNode } from '@taktak/types';

export class DiscordIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'Discord',
      authType: AuthType.API_KEY,
      baseUrl: 'https://discord.com/api/v10',
      requiredScopes: [],
    };
    super(config, credentials);
  }

  async execute(node: WorkflowNode, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const { operation } = node.config;

    switch (operation) {
      case 'sendMessage':
        return this.sendMessage(node.config, context);
      case 'sendWebhook':
        return this.sendWebhook(node.config, context);
      case 'createChannel':
        return this.createChannel(node.config);
      case 'addRole':
        return this.addRole(node.config);
      default:
        throw new Error(`Unknown Discord operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    // Test connection by getting current bot user
    await this.makeRequest('/users/@me', {
      method: 'GET',
      headers: {
        Authorization: `Bot ${this.credentials.apiKey}`,
      },
    });
  }

  private async sendMessage(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const channelId = this.resolveValue(config.channelId, context);
    const content = this.resolveValue(config.content, context);

    return this.makeRequest(`/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
  }

  private async sendWebhook(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const webhookUrl = this.resolveValue(config.webhookUrl, context) as string;
    const content = this.resolveValue(config.content, context);
    const username = this.resolveValue(config.username, context);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, username }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    return { success: true };
  }

  private async createChannel(config: Record<string, unknown>): Promise<unknown> {
    const { guildId, name, type } = config;

    return this.makeRequest(`/guilds/${guildId}/channels`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, type }),
    });
  }

  private async addRole(config: Record<string, unknown>): Promise<unknown> {
    const { guildId, userId, roleId } = config;

    return this.makeRequest(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${this.credentials.apiKey}`,
      },
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

