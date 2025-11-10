/**
 * Email service for sending transactional emails
 * Used for license delivery, notifications, etc.
 */

import nodemailer from 'nodemailer';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { ExternalServiceError } from '../utils/errors';
import { SettingsService } from './settingsService';

export class EmailService {
  private settingsService = new SettingsService();
  private transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize email transporter
   */
  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    // Get SMTP credentials
    const smtpPassword = config.services.smtp.password || (await this.settingsService.getApiKey('smtp'));

    if (!config.services.smtp.user || !smtpPassword) {
      throw new ExternalServiceError('SMTP', 'SMTP credentials not configured');
    }

    this.transporter = nodemailer.createTransport({
      host: config.services.smtp.host,
      port: config.services.smtp.port,
      secure: config.services.smtp.secure,
      auth: {
        user: config.services.smtp.user,
        pass: smtpPassword,
      },
    });

    return this.transporter;
  }

  /**
   * Send license key email for Desktop purchase
   */
  async sendDesktopLicenseEmail(
    email: string,
    licenseKey: string,
    customerName?: string
  ): Promise<void> {
    try {
      const transporter = await this.getTransporter();

      const name = customerName || 'there';
      const downloadUrl = 'https://github.com/MfFischer/taktak_automation_system/releases/latest';

      const subject = '🎉 Your Taktak Desktop License Key';
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Taktak Desktop License</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎉 Welcome to Taktak!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${name},
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for purchasing <strong>Taktak Desktop</strong>! 🚀
              </p>

              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your license key is ready. Follow the steps below to get started:
              </p>

              <!-- Step 1: Download -->
              <div style="margin-bottom: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 10px; color: #1f2937; font-size: 18px;">Step 1: Download Taktak Desktop</h3>
                <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px;">
                  Choose your platform and download the installer:
                </p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right: 10px;">
                      <a href="${downloadUrl}/download/Taktak-Setup.exe" style="display: inline-block; padding: 10px 20px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                        Windows
                      </a>
                    </td>
                    <td style="padding-right: 10px;">
                      <a href="${downloadUrl}/download/Taktak.dmg" style="display: inline-block; padding: 10px 20px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                        macOS
                      </a>
                    </td>
                    <td>
                      <a href="${downloadUrl}/download/Taktak.AppImage" style="display: inline-block; padding: 10px 20px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                        Linux
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Step 2: License Key -->
              <div style="margin-bottom: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 10px; color: #1f2937; font-size: 18px;">Step 2: Activate with Your License Key</h3>
                <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px;">
                  Copy your license key below and paste it when the app asks for activation:
                </p>
                <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 2px dashed #f59e0b; text-align: center;">
                  <code style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #1f2937; letter-spacing: 2px;">
                    ${licenseKey}
                  </code>
                </div>
                <p style="margin: 15px 0 0; color: #6b7280; font-size: 12px; text-align: center;">
                  💡 Tip: Click to select, then Ctrl+C (or Cmd+C) to copy
                </p>
              </div>

              <!-- Step 3: Start Automating -->
              <div style="margin-bottom: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 10px; color: #1f2937; font-size: 18px;">Step 3: Start Automating! 🎯</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Once activated, you'll have access to:
                </p>
                <ul style="margin: 10px 0 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
                  <li>18 ready-made workflow templates</li>
                  <li>Visual workflow builder</li>
                  <li>Offline-first automation</li>
                  <li>Local AI with Phi-3</li>
                  <li>Lifetime updates</li>
                </ul>
              </div>

              <!-- Support -->
              <div style="padding: 20px; background-color: #eff6ff; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;">
                  Need help? We're here for you!
                </p>
                <a href="https://github.com/MfFischer/taktak_automation_system/issues" style="color: #667eea; text-decoration: none; font-weight: 600;">
                  Get Support →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Thank you for choosing Taktak! 🙏
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is a one-time purchase with lifetime access. No recurring charges.
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Taktak. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const text = `
Hi ${name},

Thank you for purchasing Taktak Desktop! 🚀

Your License Key: ${licenseKey}

Step 1: Download Taktak Desktop
- Windows: ${downloadUrl}/download/Taktak-Setup.exe
- macOS: ${downloadUrl}/download/Taktak.dmg
- Linux: ${downloadUrl}/download/Taktak.AppImage

Step 2: Install and activate with your license key

Step 3: Start automating!

You now have access to:
- 18 ready-made workflow templates
- Visual workflow builder
- Offline-first automation
- Local AI with Phi-3
- Lifetime updates

Need help? Visit: https://github.com/MfFischer/taktak_automation_system/issues

Thank you for choosing Taktak!

© ${new Date().getFullYear()} Taktak. All rights reserved.
      `;

      await transporter.sendMail({
        from: `Taktak <${config.services.smtp.user}>`,
        to: email,
        subject,
        text,
        html,
      });

      logger.info('Desktop license email sent', { email, licenseKey });
    } catch (error) {
      logger.error('Failed to send desktop license email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email,
      });
      throw new ExternalServiceError('SMTP', error instanceof Error ? error.message : undefined);
    }
  }

  /**
   * Send license key email for Cloud Sync subscription
   */
  async sendCloudSyncLicenseEmail(
    email: string,
    licenseKey: string,
    customerName?: string
  ): Promise<void> {
    try {
      const transporter = await this.getTransporter();

      const name = customerName || 'there';

      const subject = '🎉 Your Taktak Cloud Sync License Key';
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Taktak Cloud Sync License</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">☁️ Cloud Sync Activated!</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">Hi ${name},</p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                Your <strong>Taktak Cloud Sync</strong> subscription is now active! ☁️
              </p>

              <div style="margin-bottom: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; color: #1f2937;">Your License Key:</h3>
                <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; text-align: center;">
                  <code style="font-family: monospace; font-size: 18px; font-weight: bold; color: #1f2937;">
                    ${licenseKey}
                  </code>
                </div>
              </div>

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                You now have access to:
              </p>
              <ul style="margin: 0 0 30px; padding-left: 20px; color: #374151;">
                <li>Cloud backup & sync</li>
                <li>Multi-device access</li>
                <li>Team collaboration</li>
                <li>Priority support</li>
              </ul>

              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/app/settings" style="display: inline-block; padding: 12px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Configure Cloud Sync
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Thank you for subscribing to Taktak Cloud Sync! 🙏
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      await transporter.sendMail({
        from: `Taktak <${config.services.smtp.user}>`,
        to: email,
        subject,
        html,
      });

      logger.info('Cloud sync license email sent', { email, licenseKey });
    } catch (error) {
      logger.error('Failed to send cloud sync license email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email,
      });
      throw new ExternalServiceError('SMTP', error instanceof Error ? error.message : undefined);
    }
  }
}

export const emailService = new EmailService();

