/**
 * CSV Export node handler
 * Exports data to CSV format
 */

import { stringify } from 'csv-stringify/sync';
import { writeFile } from 'fs/promises';

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';

interface CsvExportConfig {
  filePath?: string;
  data?: unknown[];
  columns?: string[];
  delimiter?: string;
  header?: boolean;
}

export class CsvExportNodeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const config = node.config as CsvExportConfig;

    logger.info('Exporting to CSV', {
      nodeId: node.id,
      hasFilePath: !!config.filePath,
    });

    try {
      // Get data to export
      const data = config.data || context.input.data || context.variables.data;

      if (!Array.isArray(data)) {
        throw new ValidationError('Data must be an array');
      }

      if (data.length === 0) {
        throw new ValidationError('Data array is empty');
      }

      // Generate CSV
      const csvContent = stringify(data, {
        delimiter: config.delimiter || ',',
        header: config.header !== false,
        columns: config.columns,
      });

      // Save to file if path provided
      if (config.filePath) {
        const filePath = this.replaceVariables(config.filePath, context);
        await writeFile(filePath, csvContent, 'utf-8');

        logger.info('CSV exported to file', {
          nodeId: node.id,
          filePath,
          recordCount: data.length,
        });

        return {
          success: true,
          filePath,
          recordCount: data.length,
        };
      }

      // Return CSV content
      logger.info('CSV generated', {
        nodeId: node.id,
        recordCount: data.length,
        size: csvContent.length,
      });

      return {
        success: true,
        csvContent,
        recordCount: data.length,
      };
    } catch (error) {
      logger.error('CSV export failed', {
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

