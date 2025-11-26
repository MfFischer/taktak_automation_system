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

      // Fetch without sort to avoid index issues
      const result = await this.db.find({
        selector,
        limit: config.limit,
        skip: config.skip,
      }) as any;

      // Sort in memory if sort is specified
      let docs = result.docs;
      if (config.sort) {
        const sortField = Object.keys(config.sort)[0];
        const sortOrder = (config.sort as any)[sortField];

        docs = docs.sort((a: any, b: any) => {
          const aVal = a[sortField];
          const bVal = b[sortField];

          if (aVal === bVal) return 0;
          if (aVal === undefined) return 1;
          if (bVal === undefined) return -1;

          const comparison = aVal < bVal ? -1 : 1;
          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      logger.info('Database query completed', {
        nodeId: node.id,
        resultCount: docs.length,
      });

      if (config.operation === 'findOne') {
        return docs[0] || null;
      }

      if (config.operation === 'count') {
        return { count: docs.length };
      }

      return docs;
    } catch (error) {
      logger.error('Database query failed', {
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
}

