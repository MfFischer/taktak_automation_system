/**
 * Google Sheets Integration Node
 * Read and write data to Google Sheets
 */

import axios from 'axios';
import { WorkflowNode } from '@taktak/types';
import { BaseNodeHandler } from './sdk/NodeSDK';

interface NodeContext {
  input: Record<string, unknown>;
  variables: Record<string, unknown>;
}

export interface GoogleSheetsNodeConfig {
  action: 'read' | 'write' | 'append' | 'update' | 'clear';
  apiKey?: string;
  accessToken?: string;
  spreadsheetId: string;
  sheetName?: string;
  range?: string;
  values?: unknown[][];
  valueInputOption?: 'RAW' | 'USER_ENTERED';
}

export class GoogleSheetsNodeHandler extends BaseNodeHandler {
  private readonly SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

  async execute(node: WorkflowNode, context: NodeContext): Promise<unknown> {
    const config = node.config as unknown as GoogleSheetsNodeConfig;

    // Validate required fields
    this.validateRequired(config, ['action', 'spreadsheetId']);

    if (!config.apiKey && !config.accessToken) {
      throw new Error('Either apiKey or accessToken is required');
    }

    // Resolve expressions
    const resolvedConfig: GoogleSheetsNodeConfig = {
      ...config,
      spreadsheetId: this.resolveExpression(config.spreadsheetId as string, context) as string,
      sheetName: config.sheetName ? this.resolveExpression(config.sheetName as string, context) as string : undefined,
      range: config.range ? this.resolveExpression(config.range as string, context) as string : undefined,
    };

    switch (config.action) {
      case 'read':
        return await this.readSheet(resolvedConfig);
      case 'write':
        return await this.writeSheet(resolvedConfig);
      case 'append':
        return await this.appendSheet(resolvedConfig);
      case 'update':
        return await this.updateSheet(resolvedConfig);
      case 'clear':
        return await this.clearSheet(resolvedConfig);
      default:
        throw new Error(`Unknown action: ${config.action}`);
    }
  }

  private async readSheet(config: GoogleSheetsNodeConfig): Promise<unknown> {
    const range = config.range || `${config.sheetName || 'Sheet1'}!A1:Z1000`;
    const url = `${this.SHEETS_API_BASE}/${config.spreadsheetId}/values/${range}`;

    const response = await axios.get(url, {
      headers: this.getHeaders(config),
    });

    return {
      success: true,
      values: response.data.values || [],
      range: response.data.range,
      rowCount: response.data.values?.length || 0,
    };
  }

  private async writeSheet(config: GoogleSheetsNodeConfig): Promise<unknown> {
    this.validateRequired(config, ['values']);
    
    const range = config.range || `${config.sheetName || 'Sheet1'}!A1`;
    const url = `${this.SHEETS_API_BASE}/${config.spreadsheetId}/values/${range}`;

    const response = await axios.put(
      url,
      {
        range,
        values: config.values,
        majorDimension: 'ROWS',
      },
      {
        headers: this.getHeaders(config),
        params: {
          valueInputOption: config.valueInputOption || 'USER_ENTERED',
        },
      }
    );

    return {
      success: true,
      updatedRange: response.data.updatedRange,
      updatedRows: response.data.updatedRows,
      updatedColumns: response.data.updatedColumns,
      updatedCells: response.data.updatedCells,
    };
  }

  private async appendSheet(config: GoogleSheetsNodeConfig): Promise<unknown> {
    this.validateRequired(config, ['values']);
    
    const range = config.range || `${config.sheetName || 'Sheet1'}!A1`;
    const url = `${this.SHEETS_API_BASE}/${config.spreadsheetId}/values/${range}:append`;

    const response = await axios.post(
      url,
      {
        range,
        values: config.values,
        majorDimension: 'ROWS',
      },
      {
        headers: this.getHeaders(config),
        params: {
          valueInputOption: config.valueInputOption || 'USER_ENTERED',
        },
      }
    );

    return {
      success: true,
      updatedRange: response.data.updates.updatedRange,
      updatedRows: response.data.updates.updatedRows,
      updatedColumns: response.data.updates.updatedColumns,
      updatedCells: response.data.updates.updatedCells,
    };
  }

  private async updateSheet(config: GoogleSheetsNodeConfig): Promise<unknown> {
    return await this.writeSheet(config);
  }

  private async clearSheet(config: GoogleSheetsNodeConfig): Promise<unknown> {
    const range = config.range || `${config.sheetName || 'Sheet1'}!A1:Z1000`;
    const url = `${this.SHEETS_API_BASE}/${config.spreadsheetId}/values/${range}:clear`;

    const response = await axios.post(
      url,
      {},
      {
        headers: this.getHeaders(config),
      }
    );

    return {
      success: true,
      clearedRange: response.data.clearedRange,
    };
  }

  private getHeaders(config: GoogleSheetsNodeConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.accessToken) {
      headers['Authorization'] = `Bearer ${config.accessToken}`;
    } else if (config.apiKey) {
      // API key is passed as query parameter, not header
    }

    return headers;
  }
}

