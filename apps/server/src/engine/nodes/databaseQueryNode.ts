/**
 * Database query node handler
 * Queries PouchDB database
 */

import { WorkflowNode, DatabaseQueryConfig } from '@taktak/types';

import { NodeHandler } from '../nodeExecutor';
import { getLocalDatabase } from '../../database/pouchdb';
import { logger } from '../../utils/logger';

export class DatabaseQueryNodeHandler implements NodeHandler {
  private db = getLocalDatabase();

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const config = node.config as unknown as DatabaseQueryConfig;

    logger.info('Querying database', {
      nodeId: node.id,
      collection: config.collection,
      operation: config.operation,
    });

    try {
      const selector = {
        type: config.collection,
        ...config.query,
      };

      const result = await this.db.find({
        selector,
        sort: config.sort ? [config.sort as any] : undefined,
        limit: config.limit,
        skip: config.skip,
      }) as any;

      logger.info('Database query completed', {
        nodeId: node.id,
        resultCount: result.docs.length,
      });

      if (config.operation === 'findOne') {
        return result.docs[0] || null;
      }

      if (config.operation === 'count') {
        return { count: result.docs.length };
      }

      return result.docs;
    } catch (error) {
      logger.error('Database query failed', {
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
}

