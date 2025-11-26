/**
 * Trello Integration
 * Supports boards, cards, checklists
 */

import { BaseIntegration, AuthCredentials, IntegrationConfig, AuthType } from '../base/BaseIntegration.js';
import { WorkflowNode } from '@taktak/types';

export class TrelloIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'Trello',
      authType: AuthType.API_KEY,
      baseUrl: 'https://api.trello.com/1',
      requiredScopes: [],
    };
    super(config, credentials);
  }

  async execute(node: WorkflowNode, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const { operation } = node.config;

    switch (operation) {
      case 'createCard':
        return this.createCard(node.config, context);
      case 'updateCard':
        return this.updateCard(node.config, context);
      case 'createBoard':
        return this.createBoard(node.config, context);
      case 'addChecklist':
        return this.addChecklist(node.config, context);
      default:
        throw new Error(`Unknown Trello operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    // Test connection by getting current user
    await this.makeRequest(`/members/me?key=${this.credentials.apiKey}&token=${this.credentials.accessToken}`, {
      method: 'GET',
    });
  }

  private async createCard(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const listId = this.resolveValue(config.listId, context);
    const name = this.resolveValue(config.name, context);
    const desc = this.resolveValue(config.desc, context);

    return this.makeRequest(`/cards?key=${this.credentials.apiKey}&token=${this.credentials.accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idList: listId, name, desc }),
    });
  }

  private async updateCard(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const cardId = this.resolveValue(config.cardId, context);
    const name = this.resolveValue(config.name, context);
    const desc = this.resolveValue(config.desc, context);

    return this.makeRequest(`/cards/${cardId}?key=${this.credentials.apiKey}&token=${this.credentials.accessToken}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, desc }),
    });
  }

  private async createBoard(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const name = this.resolveValue(config.name, context);

    return this.makeRequest(`/boards?key=${this.credentials.apiKey}&token=${this.credentials.accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  private async addChecklist(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const cardId = this.resolveValue(config.cardId, context);
    const name = this.resolveValue(config.name, context);

    return this.makeRequest(`/checklists?key=${this.credentials.apiKey}&token=${this.credentials.accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idCard: cardId, name }),
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

