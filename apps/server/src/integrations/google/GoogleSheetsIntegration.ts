/**
 * Google Sheets Integration
 * Supports reading, writing, and updating Google Sheets
 */

import { WorkflowNode } from '@taktak/types';
import { BaseIntegration, AuthType, IntegrationConfig, AuthCredentials } from '../base/BaseIntegration';
import { logger } from '../../utils/logger';

export class GoogleSheetsIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'Google Sheets',
      authType: AuthType.OAUTH2,
      baseUrl: 'https://sheets.googleapis.com/v4',
      requiredScopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    };
    super(config, credentials);
  }

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { operation, spreadsheetId, range, values, sheetName } = node.config;

    logger.info('Executing Google Sheets operation', {
      operation,
      spreadsheetId,
      range,
    });

    switch (operation) {
      case 'read':
        return this.readSheet(spreadsheetId as string, range as string);
      
      case 'append':
        return this.appendRows(spreadsheetId as string, range as string, values as any[][]);
      
      case 'update':
        return this.updateCells(spreadsheetId as string, range as string, values as any[][]);
      
      case 'clear':
        return this.clearRange(spreadsheetId as string, range as string);
      
      case 'create':
        return this.createSheet(sheetName as string);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    // Test by listing spreadsheets (requires Drive API)
    await this.makeRequest('/spreadsheets', { method: 'GET' });
  }

  /**
   * Read data from a sheet
   */
  private async readSheet(spreadsheetId: string, range: string): Promise<any> {
    const response = await this.makeRequest(
      `/spreadsheets/${spreadsheetId}/values/${range}`,
      { method: 'GET' }
    );

    return {
      range: response.range,
      values: response.values || [],
      rowCount: response.values?.length || 0,
    };
  }

  /**
   * Append rows to a sheet
   */
  private async appendRows(spreadsheetId: string, range: string, values: any[][]): Promise<any> {
    const response = await this.makeRequest(
      `/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        body: JSON.stringify({ values }),
      }
    );

    return {
      updatedRange: response.updates.updatedRange,
      updatedRows: response.updates.updatedRows,
      updatedColumns: response.updates.updatedColumns,
    };
  }

  /**
   * Update cells in a sheet
   */
  private async updateCells(spreadsheetId: string, range: string, values: any[][]): Promise<any> {
    const response = await this.makeRequest(
      `/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        body: JSON.stringify({ values }),
      }
    );

    return {
      updatedRange: response.updatedRange,
      updatedRows: response.updatedRows,
      updatedColumns: response.updatedColumns,
    };
  }

  /**
   * Clear a range in a sheet
   */
  private async clearRange(spreadsheetId: string, range: string): Promise<any> {
    const response = await this.makeRequest(
      `/spreadsheets/${spreadsheetId}/values/${range}:clear`,
      { method: 'POST' }
    );

    return {
      clearedRange: response.clearedRange,
    };
  }

  /**
   * Create a new spreadsheet
   */
  private async createSheet(title: string): Promise<any> {
    const response = await this.makeRequest(
      '/spreadsheets',
      {
        method: 'POST',
        body: JSON.stringify({
          properties: { title },
        }),
      }
    );

    return {
      spreadsheetId: response.spreadsheetId,
      spreadsheetUrl: response.spreadsheetUrl,
      title: response.properties.title,
    };
  }
}

