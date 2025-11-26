/**
 * Asana Integration
 * Supports projects, tasks, subtasks
 */

import { BaseIntegration, AuthCredentials, IntegrationConfig, AuthType } from '../base/BaseIntegration.js';
import { WorkflowNode } from '@taktak/types';

export class AsanaIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'Asana',
      authType: AuthType.API_KEY,
      baseUrl: 'https://app.asana.com/api/1.0',
      requiredScopes: [],
    };
    super(config, credentials);
  }

  async execute(node: WorkflowNode, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const { operation } = node.config;

    switch (operation) {
      case 'createTask':
        return this.createTask(node.config, context);
      case 'updateTask':
        return this.updateTask(node.config, context);
      case 'createProject':
        return this.createProject(node.config, context);
      case 'addSubtask':
        return this.addSubtask(node.config, context);
      default:
        throw new Error(`Unknown Asana operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    // Test connection by getting current user
    await this.makeRequest('/users/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.credentials.apiKey}`,
      },
    });
  }

  private async createTask(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const name = this.resolveValue(config.name, context);
    const notes = this.resolveValue(config.notes, context);
    const workspace = this.resolveValue(config.workspace, context);

    return this.makeRequest('/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { name, notes, workspace },
      }),
    });
  }

  private async updateTask(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const taskId = this.resolveValue(config.taskId, context);
    const name = this.resolveValue(config.name, context);
    const notes = this.resolveValue(config.notes, context);

    return this.makeRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { name, notes },
      }),
    });
  }

  private async createProject(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const name = this.resolveValue(config.name, context);
    const workspace = this.resolveValue(config.workspace, context);

    return this.makeRequest('/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { name, workspace },
      }),
    });
  }

  private async addSubtask(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const parentTaskId = this.resolveValue(config.parentTaskId, context);
    const name = this.resolveValue(config.name, context);

    return this.makeRequest(`/tasks/${parentTaskId}/subtasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { name },
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

