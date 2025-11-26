/**
 * Base Integration Class
 * Provides common functionality for all integrations
 */

import { WorkflowNode } from '@taktak/types';
import { logger } from '../../utils/logger';

export enum AuthType {
  NONE = 'none',
  API_KEY = 'api_key',
  OAUTH2 = 'oauth2',
  BASIC = 'basic',
}

export interface IntegrationConfig {
  name: string;
  authType: AuthType;
  baseUrl?: string;
  requiredScopes?: string[];
  baseId?: string; // For Airtable
  [key: string]: any; // Allow additional properties
}

export interface AuthCredentials {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  password?: string;
}

export abstract class BaseIntegration {
  protected config: IntegrationConfig;
  protected credentials: AuthCredentials;

  constructor(config: IntegrationConfig, credentials: AuthCredentials) {
    this.config = config;
    this.credentials = credentials;
  }

  /**
   * Execute the integration action
   */
  abstract execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown>;

  /**
   * Validate credentials
   */
  async validateCredentials(): Promise<boolean> {
    try {
      await this.testConnection();
      return true;
    } catch (error) {
      logger.error('Credential validation failed', {
        integration: this.config.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Test connection to the service
   */
  protected abstract testConnection(): Promise<void>;

  /**
   * Make an authenticated HTTP request
   */
  protected async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = this.config.baseUrl
      ? `${this.config.baseUrl}${endpoint}`
      : endpoint;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authentication headers
    if (this.config.authType === AuthType.API_KEY && this.credentials.apiKey) {
      headers['Authorization'] = `Bearer ${this.credentials.apiKey}`;
    } else if (this.config.authType === AuthType.OAUTH2 && this.credentials.accessToken) {
      headers['Authorization'] = `Bearer ${this.credentials.accessToken}`;
    } else if (this.config.authType === AuthType.BASIC && this.credentials.username && this.credentials.password) {
      const encoded = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
      headers['Authorization'] = `Basic ${encoded}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${this.config.name} API error: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  /**
   * Handle rate limiting with exponential backoff
   */
  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Check if it's a rate limit error
        if (lastError.message.includes('429') || lastError.message.includes('rate limit')) {
          const delay = baseDelay * Math.pow(2, attempt);
          logger.warn(`Rate limited, retrying in ${delay}ms`, {
            integration: this.config.name,
            attempt: attempt + 1,
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw lastError;
        }
      }
    }

    throw lastError;
  }
}

