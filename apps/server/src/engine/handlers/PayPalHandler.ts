/**
 * PayPal Node Handler
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { PayPalIntegration } from '../../integrations/paypal/PayPalIntegration';

export class PayPalHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    // Extract credentials from node config
    const { accessToken } = node.config;

    if (!accessToken) {
      throw new Error('PayPal access token is required');
    }

    // Create integration instance
    const integration = new PayPalIntegration({ accessToken: accessToken as string });

    // Execute the operation
    return integration.execute(node, context);
  }
}

