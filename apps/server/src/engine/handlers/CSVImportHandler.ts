/**
 * CSV Import Node Handler
 * Parses CSV data into JSON
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';

export class CSVImportHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { csvData, delimiter, hasHeader } = node.config;

    if (!csvData) {
      throw new Error('CSV data is required');
    }

    // Resolve CSV data
    const resolvedData = this.resolveValue(csvData, context) as string;
    const resolvedDelimiter = (delimiter as string) || ',';
    const resolvedHasHeader = hasHeader !== false; // Default to true

    // Parse CSV
    const lines = resolvedData.split('\n').filter(line => line.trim());
    const result: Record<string, unknown>[] = [];

    if (lines.length === 0) {
      return result;
    }

    // Get headers
    const headers = resolvedHasHeader
      ? this.parseLine(lines[0], resolvedDelimiter)
      : lines[0].split(resolvedDelimiter).map((_, i) => `column_${i}`);

    // Parse data rows
    const startIndex = resolvedHasHeader ? 1 : 0;
    for (let i = startIndex; i < lines.length; i++) {
      const values = this.parseLine(lines[i], resolvedDelimiter);
      const row: Record<string, unknown> = {};

      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || '';
      }

      result.push(row);
    }

    return {
      rows: result,
      count: result.length,
      headers,
    };
  }

  private parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private resolveValue(value: unknown, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): unknown {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const key = value.slice(2, -2).trim();
      return context.variables[key] ?? context.input[key] ?? value;
    }
    return value;
  }
}

