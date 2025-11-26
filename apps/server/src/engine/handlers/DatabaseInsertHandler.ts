/**
 * Database Insert Node Handler
 * Inserts data into PouchDB
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { getLocalDatabase } from '../../database/pouchdb';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseInsertHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { collection, data } = node.config;

    if (!collection) {
      throw new Error('Collection name is required for database insert');
    }

    if (!data) {
      throw new Error('Data is required for database insert');
    }

    const db = getLocalDatabase();

    // Resolve data
    const resolvedData = this.resolveObject(data as Record<string, unknown>, context);

    // Create document
    const document = {
      _id: `${collection}_${uuidv4()}`,
      type: collection,
      ...resolvedData,
      createdAt: new Date().toISOString(),
    };

    // Insert document
    const result = await db.put(document);

    return {
      id: result.id,
      rev: result.rev,
      ...document,
    };
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
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        resolved[key] = this.resolveObject(value as Record<string, unknown>, context);
      } else {
        resolved[key] = this.resolveValue(value, context);
      }
    }
    return resolved;
  }
}

