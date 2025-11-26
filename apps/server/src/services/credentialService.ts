/**
 * Credential Service
 * Securely stores and retrieves OAuth2 credentials
 */

import CryptoJS from 'crypto-js';
import PouchDB from 'pouchdb';
import { logger } from '../utils/logger';

interface StoredCredential {
  _id: string;
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

export class CredentialService {
  private db: PouchDB.Database;
  private encryptionKey: string;

  constructor() {
    this.db = new PouchDB('credentials');
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  }

  /**
   * Encrypt sensitive data
   */
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Store credential
   */
  async storeCredential(
    userId: string,
    provider: string,
    credential: {
      accessToken: string;
      refreshToken?: string;
      expiresAt?: number;
    }
  ): Promise<void> {
    try {
      const docId = `${userId}:${provider}`;
      const now = Date.now();

      // Encrypt tokens
      const encryptedAccessToken = this.encrypt(credential.accessToken);
      const encryptedRefreshToken = credential.refreshToken
        ? this.encrypt(credential.refreshToken)
        : undefined;

      const doc: StoredCredential = {
        _id: docId,
        userId,
        provider,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: credential.expiresAt,
        createdAt: now,
        updatedAt: now,
      };

      // Try to get existing doc to preserve _rev
      try {
        const existing = await this.db.get(docId);
        await this.db.put({ ...doc, _rev: existing._rev });
      } catch (error) {
        // Doc doesn't exist, create new
        await this.db.put(doc);
      }

      logger.info('Credential stored', { userId, provider });
    } catch (error) {
      logger.error('Failed to store credential', { userId, provider, error });
      throw error;
    }
  }

  /**
   * Get credential
   */
  async getCredential(
    userId: string,
    provider: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: number } | null> {
    try {
      const docId = `${userId}:${provider}`;
      const doc = (await this.db.get(docId)) as StoredCredential;

      // Decrypt tokens
      const accessToken = this.decrypt(doc.accessToken);
      const refreshToken = doc.refreshToken ? this.decrypt(doc.refreshToken) : undefined;

      return {
        accessToken,
        refreshToken,
        expiresAt: doc.expiresAt,
      };
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      logger.error('Failed to get credential', { userId, provider, error });
      throw error;
    }
  }

  /**
   * List all credentials for a user
   */
  async listCredentials(userId: string): Promise<Array<{ provider: string; connected: boolean; expiresAt?: number }>> {
    try {
      const result = await this.db.allDocs({
        include_docs: true,
        startkey: `${userId}:`,
        endkey: `${userId}:\uffff`,
      });

      return result.rows.map((row) => {
        const doc = row.doc as any as StoredCredential;
        return {
          provider: doc.provider,
          connected: true,
          expiresAt: doc.expiresAt,
        };
      });
    } catch (error) {
      logger.error('Failed to list credentials', { userId, error });
      throw error;
    }
  }

  /**
   * Delete credential
   */
  async deleteCredential(userId: string, provider: string): Promise<void> {
    try {
      const docId = `${userId}:${provider}`;
      const doc = await this.db.get(docId);
      await this.db.remove(doc);
      logger.info('Credential deleted', { userId, provider });
    } catch (error: any) {
      if (error.status === 404) {
        // Already deleted
        return;
      }
      logger.error('Failed to delete credential', { userId, provider, error });
      throw error;
    }
  }
}

