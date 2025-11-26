/**
 * Notion Integration
 * Supports pages, databases, and blocks operations
 */

import { Client } from '@notionhq/client';
import { WorkflowNode } from '@taktak/types';
import { BaseIntegration, AuthType, IntegrationConfig, AuthCredentials } from '../base/BaseIntegration';

export class NotionIntegration extends BaseIntegration {
  private client: Client | null = null;

  constructor(config: IntegrationConfig, credentials: AuthCredentials) {
    super(config, credentials);
    this.config.authType = AuthType.API_KEY;
  }

  protected async testConnection(): Promise<void> {
    this.client = new Client({ auth: this.credentials.apiKey });
    await this.client.users.me({});
  }

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    if (!this.client) {
      this.client = new Client({ auth: this.credentials.apiKey });
    }

    const { operation } = node.config;

    switch (operation) {
      case 'createPage':
        return this.createPage(node.config);
      case 'getPage':
        return this.getPage(node.config);
      case 'updatePage':
        return this.updatePage(node.config);
      case 'queryDatabase':
        return this.queryDatabase(node.config);
      case 'createDatabase':
        return this.createDatabase(node.config);
      case 'appendBlock':
        return this.appendBlock(node.config);
      default:
        throw new Error(`Unknown Notion operation: ${operation}`);
    }
  }

  private async createPage(config: Record<string, unknown>): Promise<unknown> {
    const { parentId, title, content } = config;
    
    return this.client!.pages.create({
      parent: { database_id: parentId as string },
      properties: {
        title: {
          title: [{ text: { content: title as string } }],
        },
      },
      children: content ? [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: content as string } }],
          },
        },
      ] : undefined,
    });
  }

  private async getPage(config: Record<string, unknown>): Promise<unknown> {
    const { pageId } = config;
    return this.client!.pages.retrieve({ page_id: pageId as string });
  }

  private async updatePage(config: Record<string, unknown>): Promise<unknown> {
    const { pageId, properties } = config;
    
    return this.client!.pages.update({
      page_id: pageId as string,
      properties: properties as any,
    });
  }

  private async queryDatabase(config: Record<string, unknown>): Promise<unknown> {
    const { databaseId } = config;

    // Use the search API to find pages in a database
    return this.client!.search({
      filter: {
        value: 'page' as any,
        property: 'object',
      },
      query: databaseId as string,
    });
  }

  private async createDatabase(config: Record<string, unknown>): Promise<unknown> {
    const { parentId, title } = config;

    return this.client!.databases.create({
      parent: { type: 'page_id', page_id: parentId as string },
      title: [{ type: 'text', text: { content: title as string } }],
    } as any);
  }

  private async appendBlock(config: Record<string, unknown>): Promise<unknown> {
    const { blockId, children } = config;
    
    return this.client!.blocks.children.append({
      block_id: blockId as string,
      children: children as any,
    });
  }
}

