/**
 * Database Watch node handler
 * Triggers workflow when database changes occur (trigger node)
 */

import { WorkflowNode } from '@taktak/types';

import { NodeHandler } from '../nodeExecutor';
import { logger } from '../../utils/logger';

export class DatabaseWatchNodeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const config = node.config as {
      table?: string;
      collection?: string;
      event?: 'insert' | 'update' | 'delete' | 'all';
      filter?: Record<string, unknown>;
    };

    logger.info('Database watch node triggered', {
      nodeId: node.id,
      table: config.table || config.collection,
      event: config.event || 'all',
      hasInput: Object.keys(context.input).length > 0,
    });

    // Database watch nodes are triggers - they pass through the database change data
    // The actual database watching is handled by a separate service/listener
    // For manual execution, we just pass through any input data
    return {
      triggered: true,
      timestamp: new Date().toISOString(),
      table: config.table || config.collection,
      event: config.event || 'all',
      data: context.input,
    };
  }
}

