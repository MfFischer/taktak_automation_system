/**
 * GitLab Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { GitLabIntegration } from '../../integrations/gitlab/GitLabIntegration';

export class GitLabHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    // Extract credentials from node config
    const { apiKey } = node.config;

    if (!apiKey) {
      throw new Error('GitLab API key (personal access token) is required');
    }

    // Create integration instance
    const integration = new GitLabIntegration({ apiKey: apiKey as string });

    // Execute the operation
    return integration.execute(node, context);
  }
}

