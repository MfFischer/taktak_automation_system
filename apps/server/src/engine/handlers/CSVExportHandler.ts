/**
 * CSV Export Node Handler
 * Converts JSON data to CSV format
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';

export class CSVExportHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { data, delimiter, includeHeader } = node.config;

    if (!data) {
      throw new Error('Data is required for CSV export');
    }

    // Resolve data
    const resolvedData = this.resolveValue(data, context);
    const resolvedDelimiter = (delimiter as string) || ',';
    const resolvedIncludeHeader = includeHeader !== false; // Default to true

    if (!Array.isArray(resolvedData)) {
      throw new Error('Data must be an array for CSV export');
    }

    if (resolvedData.length === 0) {
      return { csv: '', rowCount: 0 };
    }

    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    for (const item of resolvedData) {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    }

    const headers = Array.from(allKeys);
    const lines: string[] = [];

    // Add header row
    if (resolvedIncludeHeader) {
      lines.push(headers.map(h => this.escapeCSVValue(h, resolvedDelimiter)).join(resolvedDelimiter));
    }

    // Add data rows
    for (const item of resolvedData) {
      if (typeof item === 'object' && item !== null) {
        const row = headers.map(header => {
          const value = (item as Record<string, unknown>)[header];
          return this.escapeCSVValue(String(value ?? ''), resolvedDelimiter);
        });
        lines.push(row.join(resolvedDelimiter));
      }
    }

    const csv = lines.join('\n');

    return {
      csv,
      rowCount: resolvedData.length,
      headers,
    };
  }

  private escapeCSVValue(value: string, delimiter: string): string {
    // Escape quotes and wrap in quotes if contains delimiter, quotes, or newlines
    if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private resolveValue(value: unknown, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): unknown {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const key = value.slice(2, -2).trim();
      return context.variables[key] ?? context.input[key] ?? value;
    }
    return value;
  }
}

