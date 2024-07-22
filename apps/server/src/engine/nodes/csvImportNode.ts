/**
 * CSV Import node handler
 * Imports and parses CSV files
 */

import { parse } from 'csv-parse/sync';
import { readFile } from 'fs/promises';

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';

interface CsvImportConfig {
  filePath?: string;
  fileContent?: string;
  delimiter?: string;
  hasHeader?: boolean;
  columns?: string[];
  skipEmptyLines?: boolean;
}

export class CsvImportNodeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const config = node.config as CsvImportConfig;

    logger.info('Importing CSV', {
      nodeId: node.id,
      hasFilePath: !!config.filePath,
      hasContent: !!config.fileContent,
    });

    try {
      let csvContent: string;

      // Get CSV content from file or direct input
      if (config.filePath) {
        const filePath = this.replaceVariables(config.filePath, context);
        csvContent = await readFile(filePath, 'utf-8');
      } else if (config.fileContent) {
        csvContent = config.fileContent;
      } else if (context.input.csvContent) {
        csvContent = String(context.input.csvContent);
      } else {
        throw new ValidationError('No CSV content provided');
      }

      // Parse CSV
      const records = parse(csvContent, {
        delimiter: config.delimiter || ',',
        columns: config.hasHeader !== false ? true : config.columns,
        skip_empty_lines: config.skipEmptyLines !== false,
        trim: true,
        cast: true,
      });

      logger.info('CSV imported successfully', {
        nodeId: node.id,
        recordCount: records.length,
      });

      return {
        records,
        count: records.length,
      };
    } catch (error) {
      logger.error('CSV import failed', {
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Replaces template variables in string
   */
  private replaceVariables(
    template: string,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(context.variables[key] || context.input[key] || '');
    });
  }
}

