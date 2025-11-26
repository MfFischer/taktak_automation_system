/**
 * Twilio Integration Node
 * Send SMS, make calls, send WhatsApp messages via Twilio API
 */

import { BaseNodeHandler, NodeContext } from './sdk/NodeSDK';
import { WorkflowNode } from '@taktak/types';
import { ValidationError } from '../../utils/errors';
import axios from 'axios';

/**
 * Twilio node configuration
 */
export interface TwilioNodeConfig {
  action: 'send_sms' | 'send_whatsapp' | 'make_call' | 'send_verification';
  accountSid: string; // Twilio Account SID
  authToken: string; // Twilio Auth Token
  from: string; // From phone number or WhatsApp number
  to: string; // To phone number or WhatsApp number
  
  // For send_sms and send_whatsapp
  body?: string;
  mediaUrl?: string[];
  
  // For make_call
  callUrl?: string; // TwiML URL
  statusCallback?: string;
  
  // For send_verification
  channel?: 'sms' | 'call' | 'email';
}

/**
 * Twilio node handler
 */
export class TwilioNodeHandler extends BaseNodeHandler {
  private readonly TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

  /**
   * Validate node configuration
   */
  validate(node: WorkflowNode): void {
    super.validate(node);
    
    const config = node.config as unknown as TwilioNodeConfig;
    
    if (!config.accountSid) {
      throw new ValidationError('Twilio Account SID is required');
    }
    
    if (!config.authToken) {
      throw new ValidationError('Twilio Auth Token is required');
    }
    
    if (!config.from) {
      throw new ValidationError('From number is required');
    }
    
    if (!config.to) {
      throw new ValidationError('To number is required');
    }
    
    if (!config.action) {
      throw new ValidationError('Action is required');
    }
  }

  /**
   * Execute the Twilio node
   */
  async execute(node: WorkflowNode, context: NodeContext): Promise<unknown> {
    const config = node.config as unknown as TwilioNodeConfig;
    
    switch (config.action) {
      case 'send_sms':
        return this.sendSMS(config, context);
      case 'send_whatsapp':
        return this.sendWhatsApp(config, context);
      case 'make_call':
        return this.makeCall(config, context);
      case 'send_verification':
        return this.sendVerification(config, context);
      default:
        throw new ValidationError(`Unknown action: ${config.action}`);
    }
  }

  /**
   * Send an SMS
   */
  private async sendSMS(config: TwilioNodeConfig, context: NodeContext): Promise<unknown> {
    const body = this.resolveExpression(config.body || '', context) as string;
    const to = this.resolveExpression(config.to, context) as string;
    const from = this.resolveExpression(config.from, context) as string;

    const url = `${this.TWILIO_API_BASE}/Accounts/${config.accountSid}/Messages.json`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        To: to,
        From: from,
        Body: body,
        ...(config.mediaUrl && { MediaUrl: config.mediaUrl.join(',') }),
      }),
      {
        auth: {
          username: config.accountSid,
          password: config.authToken,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  /**
   * Send a WhatsApp message
   */
  private async sendWhatsApp(config: TwilioNodeConfig, context: NodeContext): Promise<unknown> {
    const body = this.resolveExpression(config.body || '', context) as string;
    const to = `whatsapp:${this.resolveExpression(config.to, context)}`;
    const from = `whatsapp:${this.resolveExpression(config.from, context)}`;

    const url = `${this.TWILIO_API_BASE}/Accounts/${config.accountSid}/Messages.json`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        To: to,
        From: from,
        Body: body,
        ...(config.mediaUrl && { MediaUrl: config.mediaUrl.join(',') }),
      }),
      {
        auth: {
          username: config.accountSid,
          password: config.authToken,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  /**
   * Make a phone call
   */
  private async makeCall(config: TwilioNodeConfig, context: NodeContext): Promise<unknown> {
    const to = this.resolveExpression(config.to, context) as string;
    const from = this.resolveExpression(config.from, context) as string;
    const url = this.resolveExpression(config.callUrl || '', context) as string;

    const apiUrl = `${this.TWILIO_API_BASE}/Accounts/${config.accountSid}/Calls.json`;

    const response = await axios.post(
      apiUrl,
      new URLSearchParams({
        To: to,
        From: from,
        Url: url,
        ...(config.statusCallback && { StatusCallback: config.statusCallback }),
      }),
      {
        auth: {
          username: config.accountSid,
          password: config.authToken,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  /**
   * Send verification code
   */
  private async sendVerification(_config: TwilioNodeConfig, _context: NodeContext): Promise<unknown> {
    // This would use Twilio Verify API
    // Simplified implementation
    throw new ValidationError('Verification feature requires Twilio Verify service setup');
  }
}

