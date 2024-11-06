/**
 * Settings service
 * Handles application settings and configuration
 */

import { AppSettings, ApiKeyConfig, SyncConfig } from '@taktak/types';

import { getLocalDatabase, initializeRemoteDatabase, startSync, stopSync, checkRemoteConnection } from '../database/pouchdb';
import { encrypt, decrypt } from '../utils/encryption';
import { logger } from '../utils/logger';

export class SettingsService {
  private db = getLocalDatabase();
  private readonly SETTINGS_ID = 'settings';

  /**
   * Gets application settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await this.db.get(this.SETTINGS_ID);
      return settings as AppSettings;
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        // Create default settings
        return this.createDefaultSettings();
      }
      throw error;
    }
  }

  /**
   * Updates sync settings
   */
  async updateSyncSettings(syncConfig: Partial<SyncConfig>): Promise<AppSettings> {
    const settings = await this.getSettings();

    // Encrypt password if provided
    if (syncConfig.password) {
      syncConfig.encryptedPassword = encrypt(syncConfig.password);
      delete (syncConfig as { password?: string }).password;
    }

    const updated: AppSettings = {
      ...settings,
      sync: {
        ...settings.sync,
        ...syncConfig,
      },
      updatedAt: new Date().toISOString(),
    };

    await this.db.put(updated);
    logger.info('Sync settings updated');

    // Restart sync if enabled
    if (updated.sync.enabled) {
      stopSync();
      initializeRemoteDatabase();
      startSync();
    } else {
      stopSync();
    }

    return updated;
  }

  /**
   * Adds an API key
   */
  async addApiKey(keyData: Omit<ApiKeyConfig, 'id' | 'encryptedKey' | 'createdAt'>): Promise<AppSettings> {
    const settings = await this.getSettings();

    const apiKey: ApiKeyConfig = {
      id: `key:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      name: keyData.name,
      service: keyData.service,
      encryptedKey: encrypt((keyData as { key: string }).key),
      createdAt: new Date().toISOString(),
      expiresAt: keyData.expiresAt,
    };

    const updated: AppSettings = {
      ...settings,
      apiKeys: [...settings.apiKeys, apiKey],
      updatedAt: new Date().toISOString(),
    };

    await this.db.put(updated);
    logger.info('API key added', { service: keyData.service });

    return updated;
  }

  /**
   * Deletes an API key
   */
  async deleteApiKey(keyId: string): Promise<AppSettings> {
    const settings = await this.getSettings();

    const updated: AppSettings = {
      ...settings,
      apiKeys: settings.apiKeys.filter((key) => key.id !== keyId),
      updatedAt: new Date().toISOString(),
    };

    await this.db.put(updated);
    logger.info('API key deleted', { keyId });

    return updated;
  }

  /**
   * Gets decrypted API key by service
   */
  async getApiKey(service: string): Promise<string | null> {
    const settings = await this.getSettings();
    const apiKey = settings.apiKeys.find((key) => key.service === service);

    if (!apiKey) {
      return null;
    }

    // Check if expired
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      logger.warn('API key expired', { service });
      return null;
    }

    try {
      return decrypt(apiKey.encryptedKey);
    } catch (error) {
      logger.error('Failed to decrypt API key', {
        service,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Updates feature flags
   */
  async updateFeatures(features: Partial<AppSettings['features']>): Promise<AppSettings> {
    const settings = await this.getSettings();

    const updated: AppSettings = {
      ...settings,
      features: {
        ...settings.features,
        ...features,
      },
      updatedAt: new Date().toISOString(),
    };

    await this.db.put(updated);
    logger.info('Features updated', features);

    return updated;
  }

  /**
   * Tests sync connection
   */
  async testSyncConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const connected = await checkRemoteConnection();

      return {
        connected,
        message: connected ? 'Connection successful' : 'Connection failed',
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Creates default settings
   */
  private async createDefaultSettings(): Promise<AppSettings> {
    const settings: AppSettings = {
      _id: this.SETTINGS_ID,
      type: 'settings',
      sync: {
        enabled: false,
        database: 'taktak_workflows',
        autoSync: true,
        syncInterval: 5,
      },
      apiKeys: [],
      features: {
        aiEnabled: true,
        cloudSyncEnabled: false,
        analyticsEnabled: false,
      },
      security: {
        encryptionEnabled: true,
        sessionTimeout: 60,
      },
      notifications: {
        email: false,
        desktop: true,
      },
      updatedAt: new Date().toISOString(),
    };

    await this.db.put(settings);
    logger.info('Default settings created');

    return settings;
  }
}

