/**
 * Stripe Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { StripeIntegration } from '../../integrations/stripe/StripeIntegration';
import { logger } from '../../utils/logger';

export class StripeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    logger.info('Executing Stripe node', { nodeId: node.id });

    // Get credentials from node config or context
    const credentials = {
      apiKey: (node.config.apiKey as string) || (context.variables.$credentials as any)?.stripeApiKey as string,
    };

    if (!credentials.apiKey) {
      throw new Error('Stripe API key is required');
    }

    const integration = new StripeIntegration(credentials);
    return integration.execute(node, context);
  }
}

