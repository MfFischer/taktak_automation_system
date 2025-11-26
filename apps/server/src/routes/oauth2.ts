/**
 * OAuth2 Routes
 * Handles OAuth2 authentication flows
 */

import { Router, Request, Response } from 'express';
import { OAuth2Service } from '../services/oauth2Service';
import { CredentialService } from '../services/credentialService';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const oauth2Service = new OAuth2Service();
const credentialService = new CredentialService();

/**
 * Initiate OAuth2 flow
 * GET /api/oauth2/authorize/:provider
 */
router.get('/authorize/:provider', authenticateToken, (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const userId = req.user!.id;

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({ userId, provider, timestamp: Date.now() })).toString('base64');

    // Get authorization URL
    const authUrl = oauth2Service.getAuthorizationUrl(provider, state);

    res.json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    logger.error('Failed to initiate OAuth2 flow', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to initiate OAuth2 flow',
    });
  }
});

/**
 * OAuth2 callback
 * GET /api/oauth2/callback/:provider
 */
router.get('/callback/:provider', async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;

    if (!code || !state) {
      res.status(400).send('Missing code or state parameter');
      return;
    }

    // Verify state parameter
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const { userId } = stateData;

    // Exchange code for tokens
    const tokens = await oauth2Service.exchangeCodeForToken(provider, code as string);

    // Store credentials
    await credentialService.storeCredential(userId, provider, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresIn ? Date.now() + tokens.expiresIn * 1000 : undefined,
    });

    logger.info('OAuth2 flow completed', { userId, provider });

    // Redirect to success page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #667eea; margin-bottom: 1rem; }
            p { color: #666; margin-bottom: 2rem; }
            button {
              background: #667eea;
              color: white;
              border: none;
              padding: 0.75rem 2rem;
              border-radius: 0.5rem;
              font-size: 1rem;
              cursor: pointer;
            }
            button:hover { background: #5568d3; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Authorization Successful!</h1>
            <p>You have successfully connected your ${provider} account. You can now close this window.</p>
            <button onclick="window.close()">Close Window</button>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('OAuth2 callback failed', { error });
    res.status(500).send('Authorization failed. Please try again.');
  }
});

/**
 * List user's connected integrations
 * GET /api/oauth2/connections
 */
router.get('/connections', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const connections = await credentialService.listCredentials(userId);

    res.json({
      success: true,
      data: connections,
    });
  } catch (error) {
    logger.error('Failed to list connections', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to list connections',
    });
  }
});

/**
 * Disconnect an integration
 * DELETE /api/oauth2/connections/:provider
 */
router.delete('/connections/:provider', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { provider } = req.params;

    await credentialService.deleteCredential(userId, provider);

    res.json({
      success: true,
      message: `Disconnected ${provider}`,
    });
  } catch (error) {
    logger.error('Failed to disconnect integration', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect integration',
    });
  }
});

export default router;

