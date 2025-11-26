/**
 * GitHub Integration Node
 * Manage repositories, issues, pull requests, and more
 */

import axios from 'axios';
import { WorkflowNode } from '@taktak/types';
import { BaseNodeHandler } from './sdk/NodeSDK';

interface NodeContext {
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
}

export interface GitHubNodeConfig {
  action: 'create_issue' | 'create_pr' | 'get_repo' | 'list_issues' | 'add_comment' | 'merge_pr';
  token: string;
  owner: string;
  repo: string;
  title?: string;
  body?: string;
  issueNumber?: number;
  prNumber?: number;
  head?: string;
  base?: string;
  state?: 'open' | 'closed' | 'all';
  labels?: string[];
}

export class GitHubNodeHandler extends BaseNodeHandler {
  private readonly GITHUB_API_BASE = 'https://api.github.com';

  async execute(node: WorkflowNode, context: NodeContext): Promise<unknown> {
    const config = node.config as unknown as GitHubNodeConfig;

    // Validate required fields
    this.validateRequired(config, ['action', 'token', 'owner', 'repo']);

    // Resolve expressions
    const resolvedConfig: GitHubNodeConfig = {
      ...config,
      owner: this.resolveExpression(config.owner as string, context) as string,
      repo: this.resolveExpression(config.repo as string, context) as string,
      title: config.title ? this.resolveExpression(config.title as string, context) as string : undefined,
      body: config.body ? this.resolveExpression(config.body as string, context) as string : undefined,
    };

    switch (config.action) {
      case 'create_issue':
        return await this.createIssue(resolvedConfig);
      case 'create_pr':
        return await this.createPullRequest(resolvedConfig);
      case 'get_repo':
        return await this.getRepository(resolvedConfig);
      case 'list_issues':
        return await this.listIssues(resolvedConfig);
      case 'add_comment':
        return await this.addComment(resolvedConfig);
      case 'merge_pr':
        return await this.mergePullRequest(resolvedConfig);
      default:
        throw new Error(`Unknown action: ${config.action}`);
    }
  }

  private async createIssue(config: GitHubNodeConfig): Promise<unknown> {
    this.validateRequired(config, ['title']);

    const response = await axios.post(
      `${this.GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/issues`,
      {
        title: config.title,
        body: config.body,
        labels: config.labels,
      },
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      issueNumber: response.data.number,
      issueUrl: response.data.html_url,
      state: response.data.state,
    };
  }

  private async createPullRequest(config: GitHubNodeConfig): Promise<unknown> {
    this.validateRequired(config, ['title', 'head', 'base']);

    const response = await axios.post(
      `${this.GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/pulls`,
      {
        title: config.title,
        body: config.body,
        head: config.head,
        base: config.base,
      },
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      prNumber: response.data.number,
      prUrl: response.data.html_url,
      state: response.data.state,
    };
  }

  private async getRepository(config: GitHubNodeConfig): Promise<unknown> {
    const response = await axios.get(
      `${this.GITHUB_API_BASE}/repos/${config.owner}/${config.repo}`,
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      name: response.data.name,
      fullName: response.data.full_name,
      description: response.data.description,
      stars: response.data.stargazers_count,
      forks: response.data.forks_count,
      openIssues: response.data.open_issues_count,
      defaultBranch: response.data.default_branch,
    };
  }

  private async listIssues(config: GitHubNodeConfig): Promise<unknown> {
    const response = await axios.get(
      `${this.GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/issues`,
      {
        headers: this.getHeaders(config),
        params: {
          state: config.state || 'open',
        },
      }
    );

    return {
      success: true,
      issues: response.data.map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        url: issue.html_url,
        createdAt: issue.created_at,
      })),
      count: response.data.length,
    };
  }

  private async addComment(config: GitHubNodeConfig): Promise<unknown> {
    this.validateRequired(config, ['issueNumber', 'body']);

    const response = await axios.post(
      `${this.GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/issues/${config.issueNumber}/comments`,
      {
        body: config.body,
      },
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      commentId: response.data.id,
      commentUrl: response.data.html_url,
    };
  }

  private async mergePullRequest(config: GitHubNodeConfig): Promise<unknown> {
    this.validateRequired(config, ['prNumber']);

    const response = await axios.put(
      `${this.GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/pulls/${config.prNumber}/merge`,
      {
        commit_title: config.title,
        commit_message: config.body,
      },
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      merged: response.data.merged,
      sha: response.data.sha,
      message: response.data.message,
    };
  }

  private getHeaders(config: GitHubNodeConfig): Record<string, string> {
    return {
      'Authorization': `Bearer ${config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }
}

