/**
 * Google Calendar Integration
 * Supports calendar and event operations
 */

import { google } from 'googleapis';
import { WorkflowNode } from '@taktak/types';
import { BaseIntegration, AuthType, IntegrationConfig, AuthCredentials } from '../base/BaseIntegration';

export class GoogleCalendarIntegration extends BaseIntegration {
  private calendar: any = null;

  constructor(config: IntegrationConfig, credentials: AuthCredentials) {
    super(config, credentials);
    this.config.authType = AuthType.OAUTH2;
  }

  protected async testConnection(): Promise<void> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: this.credentials.accessToken });
    this.calendar = google.calendar({ version: 'v3', auth });
    await this.calendar.calendarList.list();
  }

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    if (!this.calendar) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: this.credentials.accessToken });
      this.calendar = google.calendar({ version: 'v3', auth });
    }

    const { operation } = node.config;

    switch (operation) {
      case 'listCalendars':
        return this.listCalendars();
      case 'createEvent':
        return this.createEvent(node.config);
      case 'listEvents':
        return this.listEvents(node.config);
      case 'getEvent':
        return this.getEvent(node.config);
      case 'updateEvent':
        return this.updateEvent(node.config);
      case 'deleteEvent':
        return this.deleteEvent(node.config);
      default:
        throw new Error(`Unknown Google Calendar operation: ${operation}`);
    }
  }

  private async listCalendars(): Promise<unknown> {
    const response = await this.calendar.calendarList.list();
    return response.data;
  }

  private async createEvent(config: Record<string, unknown>): Promise<unknown> {
    const { calendarId, summary, description, startTime, endTime, attendees, location } = config;
    
    const response = await this.calendar.events.insert({
      calendarId: (calendarId as string) || 'primary',
      requestBody: {
        summary: summary as string,
        description: description as string,
        location: location as string,
        start: {
          dateTime: startTime as string,
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime as string,
          timeZone: 'UTC',
        },
        attendees: attendees ? (attendees as string[]).map(email => ({ email })) : undefined,
      },
    });

    return response.data;
  }

  private async listEvents(config: Record<string, unknown>): Promise<unknown> {
    const { calendarId, timeMin, timeMax, maxResults } = config;
    
    const response = await this.calendar.events.list({
      calendarId: (calendarId as string) || 'primary',
      timeMin: timeMin as string,
      timeMax: timeMax as string,
      maxResults: (maxResults as number) || 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data;
  }

  private async getEvent(config: Record<string, unknown>): Promise<unknown> {
    const { calendarId, eventId } = config;
    
    const response = await this.calendar.events.get({
      calendarId: (calendarId as string) || 'primary',
      eventId: eventId as string,
    });

    return response.data;
  }

  private async updateEvent(config: Record<string, unknown>): Promise<unknown> {
    const { calendarId, eventId, summary, description, startTime, endTime } = config;
    
    const response = await this.calendar.events.update({
      calendarId: (calendarId as string) || 'primary',
      eventId: eventId as string,
      requestBody: {
        summary: summary as string,
        description: description as string,
        start: startTime ? {
          dateTime: startTime as string,
          timeZone: 'UTC',
        } : undefined,
        end: endTime ? {
          dateTime: endTime as string,
          timeZone: 'UTC',
        } : undefined,
      },
    });

    return response.data;
  }

  private async deleteEvent(config: Record<string, unknown>): Promise<unknown> {
    const { calendarId, eventId } = config;
    
    await this.calendar.events.delete({
      calendarId: (calendarId as string) || 'primary',
      eventId: eventId as string,
    });

    return { success: true, eventId };
  }
}

