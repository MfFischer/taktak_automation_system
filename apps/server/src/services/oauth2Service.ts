/**
 * OAuth2 Service
 * Handles OAuth2 authentication flows for various providers
 */

import axios from 'axios';
import { logger } from '../utils/logger';

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
}

export interface OAuth2Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export class OAuth2Service {
  private configs: Map<string, OAuth2Config> = new Map();

  constructor() {
    this.initializeConfigs();
  }

  private initializeConfigs() {
    // Google OAuth2
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      this.configs.set('google', {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/oauth2/callback/google',
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scopes: [
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/spreadsheets',
        ],
      });
    }

    // Slack OAuth2
    if (process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET) {
      this.configs.set('slack', {
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        redirectUri: process.env.SLACK_REDIRECT_URI || 'http://localhost:3000/api/oauth2/callback/slack',
        authorizationUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        scopes: ['chat:write', 'channels:read', 'users:read', 'files:write'],
      });
    }

    // GitHub OAuth2
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      this.configs.set('github', {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/oauth2/callback/github',
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scopes: ['repo', 'user', 'workflow'],
      });
    }
  }

  /**
   * Get authorization URL for a provider
   */
  getAuthorizationUrl(provider: string, state: string): string {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`OAuth2 provider not configured: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      access_type: 'offline', // For Google to get refresh token
      prompt: 'consent', // Force consent screen to get refresh token
    });

    return `${config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(provider: string, code: string): Promise<OAuth2Tokens> {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`OAuth2 provider not configured: ${provider}`);
    }

    try {
      const response = await axios.post(
        config.tokenUrl,
        {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        }
      );

      const data = response.data;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      };
    } catch (error) {
      logger.error('Failed to exchange code for token', { provider, error });
      throw new Error(`Failed to exchange code for token: ${error}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(provider: string, refreshToken: string): Promise<OAuth2Tokens> {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`OAuth2 provider not configured: ${provider}`);
    }

    try {
      const response = await axios.post(
        config.tokenUrl,
        {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        }
      );

      const data = response.data;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      };
    } catch (error) {
      logger.error('Failed to refresh access token', { provider, error });
      throw new Error(`Failed to refresh access token: ${error}`);
    }
  }
}

