/**
 * GitHub Integration
 * Supports repos, issues, PRs, and actions operations
 */

import { Octokit } from '@octokit/rest';
import { WorkflowNode } from '@taktak/types';
import { BaseIntegration, AuthType, IntegrationConfig, AuthCredentials } from '../base/BaseIntegration';

export class GitHubIntegration extends BaseIntegration {
  private octokit: Octokit | null = null;

  constructor(config: IntegrationConfig, credentials: AuthCredentials) {
    super(config, credentials);
    this.config.authType = AuthType.OAUTH2;
  }

  protected async testConnection(): Promise<void> {
    this.octokit = new Octokit({ auth: this.credentials.accessToken });
    await this.octokit.users.getAuthenticated();
  }

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    if (!this.octokit) {
      this.octokit = new Octokit({ auth: this.credentials.accessToken });
    }

    const { operation } = node.config;

    switch (operation) {
      case 'listRepos':
        return this.listRepos(node.config);
      case 'getRepo':
        return this.getRepo(node.config);
      case 'createIssue':
        return this.createIssue(node.config);
      case 'listIssues':
        return this.listIssues(node.config);
      case 'createPR':
        return this.createPR(node.config);
      case 'listPRs':
        return this.listPRs(node.config);
      case 'mergePR':
        return this.mergePR(node.config);
      case 'createComment':
        return this.createComment(node.config);
      default:
        throw new Error(`Unknown GitHub operation: ${operation}`);
    }
  }

  private async listRepos(config: Record<string, unknown>): Promise<unknown> {
    const { type, sort } = config;

    const response = await this.octokit!.repos.listForAuthenticatedUser({
      type: (type as any) || 'all',
      sort: (sort as any) || 'updated',
      per_page: 100,
    });

    return response.data;
  }

  private async getRepo(config: Record<string, unknown>): Promise<unknown> {
    const { owner, repo } = config;
    
    const response = await this.octokit!.repos.get({
      owner: owner as string,
      repo: repo as string,
    });

    return response.data;
  }

  private async createIssue(config: Record<string, unknown>): Promise<unknown> {
    const { owner, repo, title, body, labels } = config;
    
    const response = await this.octokit!.issues.create({
      owner: owner as string,
      repo: repo as string,
      title: title as string,
      body: body as string,
      labels: labels as string[],
    });

    return response.data;
  }

  private async listIssues(config: Record<string, unknown>): Promise<unknown> {
    const { owner, repo, state } = config;
    
    const response = await this.octokit!.issues.listForRepo({
      owner: owner as string,
      repo: repo as string,
      state: (state as 'open' | 'closed' | 'all') || 'open',
      per_page: 100,
    });

    return response.data;
  }

  private async createPR(config: Record<string, unknown>): Promise<unknown> {
    const { owner, repo, title, head, base, body } = config;
    
    const response = await this.octokit!.pulls.create({
      owner: owner as string,
      repo: repo as string,
      title: title as string,
      head: head as string,
      base: base as string,
      body: body as string,
    });

    return response.data;
  }

  private async listPRs(config: Record<string, unknown>): Promise<unknown> {
    const { owner, repo, state } = config;
    
    const response = await this.octokit!.pulls.list({
      owner: owner as string,
      repo: repo as string,
      state: (state as 'open' | 'closed' | 'all') || 'open',
      per_page: 100,
    });

    return response.data;
  }

  private async mergePR(config: Record<string, unknown>): Promise<unknown> {
    const { owner, repo, pullNumber, commitTitle } = config;
    
    const response = await this.octokit!.pulls.merge({
      owner: owner as string,
      repo: repo as string,
      pull_number: pullNumber as number,
      commit_title: commitTitle as string,
    });

    return response.data;
  }

  private async createComment(config: Record<string, unknown>): Promise<unknown> {
    const { owner, repo, issueNumber, body } = config;
    
    const response = await this.octokit!.issues.createComment({
      owner: owner as string,
      repo: repo as string,
      issue_number: issueNumber as number,
      body: body as string,
    });

    return response.data;
  }
}

