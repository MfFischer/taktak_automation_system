/**
 * Database Update Node Handler
 * Updates data in PouchDB
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';
import { getLocalDatabase } from '../../database/pouchdb';

export class DatabaseUpdateHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { documentId, data } = node.config;

    if (!documentId) {
      throw new Error('Document ID is required for database update');
    }

    if (!data) {
      throw new Error('Data is required for database update');
    }

    const db = getLocalDatabase();

    // Resolve document ID and data
    const resolvedId = this.resolveValue(documentId, context) as string;
    const resolvedData = this.resolveObject(data as Record<string, unknown>, context);

    // Get existing document
    const existingDoc = await db.get(resolvedId);

    // Update document
    const updatedDoc = {
      ...existingDoc,
      ...resolvedData,
      updatedAt: new Date().toISOString(),
    };

    // Save updated document
    const result = await db.put(updatedDoc);

    return {
      id: result.id,
      rev: result.rev,
      ...updatedDoc,
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

