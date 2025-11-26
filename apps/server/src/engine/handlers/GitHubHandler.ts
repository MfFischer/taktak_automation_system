/**
 * GitHub Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { GitHubIntegration } from '../../integrations/github/GitHubIntegration';
import { logger } from '../../utils/logger';

export class GitHubHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    logger.info('Executing GitHub node', { nodeId: node.id });

    const credentials = {
      accessToken: (node.config.accessToken as string) || (context.variables.$credentials as any)?.githubAccessToken as string,
    };

    if (!credentials.accessToken) {
      throw new Error('GitHub access token is required');
    }

    const integration = new GitHubIntegration(
      { name: 'github', authType: 'OAUTH2' as any },
      credentials
    );

    return integration.execute(node, context);
  }
}

