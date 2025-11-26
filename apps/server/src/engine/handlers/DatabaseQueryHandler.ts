/**
 * Database Query Node Handler
 * Queries data from PouchDB
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { getLocalDatabase } from '../../database/pouchdb';

export class DatabaseQueryHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { collection, query, limit } = node.config;

    if (!collection) {
      throw new Error('Collection name is required for database query');
    }

    const db = getLocalDatabase();

    // Resolve query parameters
    const resolvedQuery = query ? this.resolveObject(query as Record<string, unknown>, context) : {};

    // Build selector for PouchDB find
    const selector: Record<string, unknown> = {
      type: collection,
      ...resolvedQuery,
    };

    // Execute query
    const result = await db.find({
      selector,
      limit: (limit as number) || 100,
    });

    return result.docs;
  }

  private resolveValue(value: unknown, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): unknown {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const key = value.slice(2, -2).trim();
      return context.variables[key] ?? context.input[key] ?? value;
    }
    return value;
  }

  private resolveObject(obj: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = this.resolveValue(value, context);
    }
    return resolved;
  }
}

