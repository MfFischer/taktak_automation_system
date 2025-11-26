/**
 * Anthropic (Claude) Integration
 * Supports Claude 3.5 Sonnet AI
 */

import { BaseIntegration, AuthCredentials, IntegrationConfig, AuthType } from '../base/BaseIntegration.js';
import { WorkflowNode } from '@taktak/types';

export class AnthropicIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'Anthropic',
      authType: AuthType.API_KEY,
      baseUrl: 'https://api.anthropic.com/v1',
      requiredScopes: [],
    };
    super(config, credentials);
  }

  async execute(node: WorkflowNode, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const { operation } = node.config;

    switch (operation) {
      case 'generateText':
        return this.generateText(node.config, context);
      case 'chat':
        return this.chat(node.config, context);
      default:
        throw new Error(`Unknown Anthropic operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    // Anthropic doesn't have a dedicated test endpoint, so we'll just verify the API key format
    if (!this.credentials.apiKey || !this.credentials.apiKey.startsWith('sk-ant-')) {
      throw new Error('Invalid Anthropic API key format');
    }
  }

  private async generateText(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const prompt = this.resolveValue(config.prompt, context);
    const model = config.model || 'claude-3-5-sonnet-20241022';
    const maxTokens = config.maxTokens || 1024;

    return this.makeRequest('/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.credentials.apiKey!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });
  }

  private async chat(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const messages = this.resolveValue(config.messages, context);
    const model = config.model || 'claude-3-5-sonnet-20241022';
    const maxTokens = config.maxTokens || 1024;

    return this.makeRequest('/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.credentials.apiKey!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages,
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

