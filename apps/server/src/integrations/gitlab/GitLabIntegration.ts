/**
 * GitLab Integration
 * Supports issues, merge requests, projects
 */

import { BaseIntegration, AuthCredentials, IntegrationConfig, AuthType } from '../base/BaseIntegration.js';
import { WorkflowNode } from '@taktak/types';

export class GitLabIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'GitLab',
      authType: AuthType.API_KEY,
      baseUrl: 'https://gitlab.com/api/v4',
      requiredScopes: [],
    };
    super(config, credentials);
  }

  async execute(node: WorkflowNode, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const { operation } = node.config;

    switch (operation) {
      case 'createIssue':
        return this.createIssue(node.config, context);
      case 'createMergeRequest':
        return this.createMergeRequest(node.config, context);
      case 'getProject':
        return this.getProject(node.config, context);
      case 'listIssues':
        return this.listIssues(node.config, context);
      default:
        throw new Error(`Unknown GitLab operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    // Test connection by getting current user
    await this.makeRequest('/user', {
      method: 'GET',
      headers: {
        'PRIVATE-TOKEN': this.credentials.apiKey!,
      },
    });
  }

  private async createIssue(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const projectId = this.resolveValue(config.projectId, context);
    const title = this.resolveValue(config.title, context);
    const description = this.resolveValue(config.description, context);

    return this.makeRequest(`/projects/${projectId}/issues`, {
      method: 'POST',
      headers: {
        'PRIVATE-TOKEN': this.credentials.apiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });
  }

  private async createMergeRequest(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const projectId = this.resolveValue(config.projectId, context);
    const title = this.resolveValue(config.title, context);
    const sourceBranch = this.resolveValue(config.sourceBranch, context);
    const targetBranch = this.resolveValue(config.targetBranch, context);

    return this.makeRequest(`/projects/${projectId}/merge_requests`, {
      method: 'POST',
      headers: {
        'PRIVATE-TOKEN': this.credentials.apiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        source_branch: sourceBranch,
        target_branch: targetBranch,
      }),
    });
  }

  private async getProject(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const projectId = this.resolveValue(config.projectId, context);

    return this.makeRequest(`/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'PRIVATE-TOKEN': this.credentials.apiKey!,
      },
    });
  }

  private async listIssues(config: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Promise<unknown> {
    const projectId = this.resolveValue(config.projectId, context);

    return this.makeRequest(`/projects/${projectId}/issues`, {
      method: 'GET',
      headers: {
        'PRIVATE-TOKEN': this.credentials.apiKey!,
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

