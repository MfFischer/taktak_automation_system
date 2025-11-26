/**
 * Google Drive Integration
 * Supports file management operations
 */

import { google } from 'googleapis';
import { WorkflowNode } from '@taktak/types';
import { BaseIntegration, AuthType, IntegrationConfig, AuthCredentials } from '../base/BaseIntegration';

export class GoogleDriveIntegration extends BaseIntegration {
  private drive: any = null;

  constructor(config: IntegrationConfig, credentials: AuthCredentials) {
    super(config, credentials);
    this.config.authType = AuthType.OAUTH2;
  }

  protected async testConnection(): Promise<void> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: this.credentials.accessToken });
    this.drive = google.drive({ version: 'v3', auth });
    await this.drive.about.get({ fields: 'user' });
  }

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    if (!this.drive) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: this.credentials.accessToken });
      this.drive = google.drive({ version: 'v3', auth });
    }

    const { operation } = node.config;

    switch (operation) {
      case 'listFiles':
        return this.listFiles(node.config);
      case 'getFile':
        return this.getFile(node.config);
      case 'createFile':
        return this.createFile(node.config);
      case 'updateFile':
        return this.updateFile(node.config);
      case 'deleteFile':
        return this.deleteFile(node.config);
      case 'createFolder':
        return this.createFolder(node.config);
      case 'shareFile':
        return this.shareFile(node.config);
      default:
        throw new Error(`Unknown Google Drive operation: ${operation}`);
    }
  }

  private async listFiles(config: Record<string, unknown>): Promise<unknown> {
    const { query, pageSize } = config;
    
    const response = await this.drive.files.list({
      q: query as string,
      pageSize: (pageSize as number) || 10,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, size)',
    });

    return response.data;
  }

  private async getFile(config: Record<string, unknown>): Promise<unknown> {
    const { fileId } = config;
    
    const response = await this.drive.files.get({
      fileId: fileId as string,
      fields: 'id, name, mimeType, createdTime, modifiedTime, size, webViewLink',
    });

    return response.data;
  }

  private async createFile(config: Record<string, unknown>): Promise<unknown> {
    const { name, mimeType, content, parentId } = config;
    
    const response = await this.drive.files.create({
      requestBody: {
        name: name as string,
        mimeType: mimeType as string,
        parents: parentId ? [parentId as string] : undefined,
      },
      media: {
        mimeType: mimeType as string,
        body: content as string,
      },
      fields: 'id, name, webViewLink',
    });

    return response.data;
  }

  private async updateFile(config: Record<string, unknown>): Promise<unknown> {
    const { fileId, name, content } = config;
    
    const response = await this.drive.files.update({
      fileId: fileId as string,
      requestBody: {
        name: name as string,
      },
      media: content ? {
        body: content as string,
      } : undefined,
      fields: 'id, name, modifiedTime',
    });

    return response.data;
  }

  private async deleteFile(config: Record<string, unknown>): Promise<unknown> {
    const { fileId } = config;
    
    await this.drive.files.delete({
      fileId: fileId as string,
    });

    return { success: true, fileId };
  }

  private async createFolder(config: Record<string, unknown>): Promise<unknown> {
    const { name, parentId } = config;
    
    const response = await this.drive.files.create({
      requestBody: {
        name: name as string,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId as string] : undefined,
      },
      fields: 'id, name, webViewLink',
    });

    return response.data;
  }

  private async shareFile(config: Record<string, unknown>): Promise<unknown> {
    const { fileId, email, role } = config;
    
    const response = await this.drive.permissions.create({
      fileId: fileId as string,
      requestBody: {
        type: 'user',
        role: (role as string) || 'reader',
        emailAddress: email as string,
      },
    });

    return response.data;
  }
}

