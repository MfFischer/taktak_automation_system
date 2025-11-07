/**
 * License Service
 * Handles license key generation, validation, and activation
 */

import crypto from 'crypto';
import { getLocalDatabase } from '../database/pouchdb';
import { logger } from '../utils/logger';
import { ValidationError, NotFoundError } from '../utils/errors';

export enum LicenseTier {
  FREE = 'free',
  DESKTOP = 'desktop',
  CLOUD_SYNC = 'cloud_sync',
  WHITE_LABEL = 'white_label',
}

export interface License {
  _id: string;
  _rev?: string;
  type: 'license';
  licenseKey: string;
  tier: LicenseTier;
  email: string;
  userId?: string;
  deviceId?: string;
  activatedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  maxActivations: number;
  activationCount: number;
  metadata?: {
    orderId?: string;
    purchaseDate?: string;
    amount?: number;
    currency?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class LicenseService {
  private db = getLocalDatabase();

  /**
   * Generate a unique license key
   */
  private generateLicenseKey(tier: LicenseTier): string {
    const prefix = this.getTierPrefix(tier);
    const random = crypto.randomBytes(12).toString('hex').toUpperCase();
    
    // Format: XXXX-XXXX-XXXX-XXXX (e.g., DESK-A1B2-C3D4-E5F6)
    const key = `${prefix}-${random.slice(0, 4)}-${random.slice(4, 8)}-${random.slice(8, 12)}-${random.slice(12, 16)}`;
    return key;
  }

  /**
   * Get tier prefix for license key
   */
  private getTierPrefix(tier: LicenseTier): string {
    switch (tier) {
      case LicenseTier.FREE:
        return 'FREE';
      case LicenseTier.DESKTOP:
        return 'DESK';
      case LicenseTier.CLOUD_SYNC:
        return 'CLOD';
      case LicenseTier.WHITE_LABEL:
        return 'WHIT';
      default:
        return 'UNKN';
    }
  }

  /**
   * Get max activations for tier
   */
  private getMaxActivations(tier: LicenseTier): number {
    switch (tier) {
      case LicenseTier.FREE:
        return 1;
      case LicenseTier.DESKTOP:
        return 1; // One-time purchase, one device
      case LicenseTier.CLOUD_SYNC:
        return 3; // Multi-device sync
      case LicenseTier.WHITE_LABEL:
        return 999; // Unlimited for white-label
      default:
        return 1;
    }
  }

  /**
   * Create a new license
   */
  async createLicense(data: {
    tier: LicenseTier;
    email: string;
    expiresInDays?: number;
    metadata?: License['metadata'];
  }): Promise<License> {
    const licenseKey = this.generateLicenseKey(data.tier);
    const now = new Date().toISOString();

    const license: License = {
      _id: `license:${licenseKey}`,
      type: 'license',
      licenseKey,
      tier: data.tier,
      email: data.email,
      isActive: true,
      maxActivations: this.getMaxActivations(data.tier),
      activationCount: 0,
      metadata: data.metadata,
      createdAt: now,
      updatedAt: now,
    };

    // Set expiration for subscription tiers
    if (data.expiresInDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);
      license.expiresAt = expiresAt.toISOString();
    }

    try {
      const response = await this.db.put(license);
      logger.info('License created', { licenseKey, tier: data.tier, email: data.email });

      return {
        ...license,
        _rev: response.rev,
      };
    } catch (error) {
      logger.error('Failed to create license', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Validate a license key
   */
  async validateLicense(licenseKey: string): Promise<{
    valid: boolean;
    license?: License;
    reason?: string;
  }> {
    try {
      const license = await this.getLicenseByKey(licenseKey);

      // Check if license is active
      if (!license.isActive) {
        return { valid: false, reason: 'License is inactive' };
      }

      // Check expiration
      if (license.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(license.expiresAt);
        if (now > expiresAt) {
          return { valid: false, reason: 'License has expired' };
        }
      }

      // Check activation limit
      if (license.activationCount >= license.maxActivations) {
        return { valid: false, reason: 'Maximum activations reached' };
      }

      return { valid: true, license };
    } catch (error) {
      if (error instanceof NotFoundError) {
        return { valid: false, reason: 'License not found' };
      }
      throw error;
    }
  }

  /**
   * Activate a license for a user/device
   */
  async activateLicense(
    licenseKey: string,
    userId: string,
    deviceId?: string
  ): Promise<License> {
    const validation = await this.validateLicense(licenseKey);

    if (!validation.valid) {
      throw new ValidationError(validation.reason || 'Invalid license');
    }

    const license = validation.license!;

    // Check if already activated for this device
    if (license.deviceId && license.deviceId === deviceId) {
      logger.info('License already activated for this device', { licenseKey, deviceId });
      return license;
    }

    // Update license with activation info
    const updatedLicense: License = {
      ...license,
      userId,
      deviceId,
      activatedAt: new Date().toISOString(),
      activationCount: license.activationCount + 1,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await this.db.put(updatedLicense);
      logger.info('License activated', { licenseKey, userId, deviceId });

      return {
        ...updatedLicense,
        _rev: response.rev,
      };
    } catch (error) {
      logger.error('Failed to activate license', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Deactivate a license
   */
  async deactivateLicense(licenseKey: string): Promise<License> {
    const license = await this.getLicenseByKey(licenseKey);

    const updatedLicense: License = {
      ...license,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await this.db.put(updatedLicense);
      logger.info('License deactivated', { licenseKey });

      return {
        ...updatedLicense,
        _rev: response.rev,
      };
    } catch (error) {
      logger.error('Failed to deactivate license', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get license by key
   */
  async getLicenseByKey(licenseKey: string): Promise<License> {
    try {
      const doc = await this.db.get(`license:${licenseKey}`);
      return doc as License;
    } catch (error: any) {
      if (error.status === 404) {
        throw new NotFoundError('License not found');
      }
      throw error;
    }
  }

  /**
   * Get all licenses for an email
   */
  async getLicensesByEmail(email: string): Promise<License[]> {
    try {
      const result = await this.db.find({
        selector: {
          type: 'license',
          email,
        },
      });

      return result.docs as License[];
    } catch (error) {
      logger.error('Failed to get licenses by email', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Generate device fingerprint (for hardware binding)
   */
  generateDeviceId(machineInfo: {
    platform: string;
    arch: string;
    hostname?: string;
    macAddress?: string;
  }): string {
    const data = JSON.stringify(machineInfo);
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16).toUpperCase();
  }
}

