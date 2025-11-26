/**
 * Airtable Integration
 * Supports records, tables, and views operations
 */

import Airtable from 'airtable';
import { WorkflowNode } from '@taktak/types';
import { BaseIntegration, AuthType, IntegrationConfig, AuthCredentials } from '../base/BaseIntegration';

export class AirtableIntegration extends BaseIntegration {
  private base: any = null;

  constructor(config: IntegrationConfig, credentials: AuthCredentials) {
    super(config, credentials);
    this.config.authType = AuthType.API_KEY;
  }

  protected async testConnection(): Promise<void> {
    Airtable.configure({ apiKey: this.credentials.apiKey });
    // Test connection by attempting to access a base
    const airtable = new Airtable();
    this.base = airtable.base(this.config.baseId as string);
  }

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    if (!this.base) {
      Airtable.configure({ apiKey: this.credentials.apiKey });
      const airtable = new Airtable();
      this.base = airtable.base(node.config.baseId as string);
    }

    const { operation } = node.config;

    switch (operation) {
      case 'listRecords':
        return this.listRecords(node.config);
      case 'getRecord':
        return this.getRecord(node.config);
      case 'createRecord':
        return this.createRecord(node.config);
      case 'updateRecord':
        return this.updateRecord(node.config);
      case 'deleteRecord':
        return this.deleteRecord(node.config);
      default:
        throw new Error(`Unknown Airtable operation: ${operation}`);
    }
  }

  private async listRecords(config: Record<string, unknown>): Promise<unknown> {
    const { tableName, view, maxRecords } = config;
    
    const records: any[] = [];
    await this.base(tableName as string)
      .select({
        view: view as string,
        maxRecords: maxRecords as number || 100,
      })
      .eachPage((pageRecords: any[], fetchNextPage: () => void) => {
        records.push(...pageRecords.map((r: any) => ({ id: r.id, fields: r.fields })));
        fetchNextPage();
      });

    return records;
  }

  private async getRecord(config: Record<string, unknown>): Promise<unknown> {
    const { tableName, recordId } = config;
    
    const record = await this.base(tableName as string).find(recordId as string);
    return { id: record.id, fields: record.fields };
  }

  private async createRecord(config: Record<string, unknown>): Promise<unknown> {
    const { tableName, fields } = config;
    
    const record = await this.base(tableName as string).create(fields as any);
    return { id: record.id, fields: record.fields };
  }

  private async updateRecord(config: Record<string, unknown>): Promise<unknown> {
    const { tableName, recordId, fields } = config;
    
    const record = await this.base(tableName as string).update(recordId as string, fields as any);
    return { id: record.id, fields: record.fields };
  }

  private async deleteRecord(config: Record<string, unknown>): Promise<unknown> {
    const { tableName, recordId } = config;
    
    const record = await this.base(tableName as string).destroy(recordId as string);
    return { id: record.id, deleted: true };
  }
}

