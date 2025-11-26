/**
 * Node executor
 * Executes individual workflow nodes based on their type
 */

import { WorkflowNode, NodeType } from '@taktak/types';

import { logger } from '../utils/logger';
import { WorkflowExecutionError } from '../utils/errors';

// Import node handlers
import { ScheduleNodeHandler } from './nodes/scheduleNode';
import { SMSNodeHandler } from './nodes/smsNode';
import { EmailNodeHandler } from './nodes/emailNode';
import { DatabaseQueryNodeHandler } from './nodes/databaseQueryNode';
import { DatabaseWatchNodeHandler } from './nodes/databaseWatchNode';
import { ConditionNodeHandler } from './nodes/conditionNode';
import { AIGenerateNodeHandler } from './nodes/aiGenerateNode';
import { WebhookNodeHandler } from './nodes/webhookNode';
import { HttpRequestNodeHandler } from './nodes/httpRequestNode';
import { CsvImportNodeHandler } from './nodes/csvImportNode';
import { CsvExportNodeHandler } from './nodes/csvExportNode';
import { LoopNodeHandler } from './nodes/loopNode';
import { ErrorTriggerNodeHandler } from './nodes/errorTriggerNode';
import { SlackNodeHandler } from './nodes/slackNode';
import { DiscordNodeHandler } from './nodes/discordNode';
import { GitHubNodeHandler } from './nodes/githubNode';
import { GoogleSheetsNodeHandler } from './nodes/googleSheetsNode';
import { StripeNodeHandler } from './nodes/stripeNode';
import { TelegramNodeHandler } from './nodes/telegramNode';
import { TwilioNodeHandler } from './nodes/twilioNode';

// Import new integration handlers
import { GoogleSheetsHandler } from './handlers/GoogleSheetsHandler';
import { SlackHandler } from './handlers/SlackHandler';
import { OpenAIHandler } from './handlers/OpenAIHandler';
import { StripeHandler } from './handlers/StripeHandler';
import { NotionHandler } from './handlers/NotionHandler';
import { AirtableHandler } from './handlers/AirtableHandler';
import { GitHubHandler } from './handlers/GitHubHandler';
import { GmailHandler } from './handlers/GmailHandler';
import { GoogleDriveHandler } from './handlers/GoogleDriveHandler';
import { GoogleCalendarHandler } from './handlers/GoogleCalendarHandler';
import { DiscordHandler } from './handlers/DiscordHandler';
import { TelegramHandler } from './handlers/TelegramHandler';
import { TwilioHandler } from './handlers/TwilioHandler';
import { GitLabHandler } from './handlers/GitLabHandler';
import { PayPalHandler } from './handlers/PayPalHandler';
import { TrelloHandler } from './handlers/TrelloHandler';
import { AsanaHandler } from './handlers/AsanaHandler';
import { AnthropicHandler } from './handlers/AnthropicHandler';
import { SendSMSHandler } from './handlers/SendSMSHandler';
import { SendEmailHandler } from './handlers/SendEmailHandler';
import { HTTPRequestHandler } from './handlers/HTTPRequestHandler';
import { DatabaseQueryHandler } from './handlers/DatabaseQueryHandler';
import { DatabaseInsertHandler } from './handlers/DatabaseInsertHandler';
import { DatabaseUpdateHandler } from './handlers/DatabaseUpdateHandler';
import { ConditionHandler } from './handlers/ConditionHandler';
import { LoopHandler } from './handlers/LoopHandler';
import { DelayHandler } from './handlers/DelayHandler';
import { TransformHandler } from './handlers/TransformHandler';
import { CSVImportHandler } from './handlers/CSVImportHandler';
import { CSVExportHandler } from './handlers/CSVExportHandler';
import { ScheduleHandler } from './handlers/ScheduleHandler';
import { WebhookHandler } from './handlers/WebhookHandler';
import { DatabaseWatchHandler } from './handlers/DatabaseWatchHandler';
import { ErrorTriggerHandler } from './handlers/ErrorTriggerHandler';

export class NodeExecutor {
  private handlers: Map<NodeType, NodeHandler>;

  constructor() {
    // Register node handlers
    this.handlers = new Map();
    this.handlers.set(NodeType.SCHEDULE, new ScheduleNodeHandler());
    this.handlers.set(NodeType.SEND_SMS, new SMSNodeHandler());
    this.handlers.set(NodeType.SEND_EMAIL, new EmailNodeHandler());
    this.handlers.set(NodeType.DATABASE_QUERY, new DatabaseQueryNodeHandler());
    this.handlers.set(NodeType.DATABASE_WATCH, new DatabaseWatchNodeHandler());
    this.handlers.set(NodeType.CONDITION, new ConditionNodeHandler());
    this.handlers.set(NodeType.AI_GENERATE, new AIGenerateNodeHandler());
    this.handlers.set(NodeType.WEBHOOK, new WebhookNodeHandler());
    this.handlers.set(NodeType.HTTP_REQUEST, new HttpRequestNodeHandler());
    this.handlers.set(NodeType.CSV_IMPORT, new CsvImportNodeHandler());
    this.handlers.set(NodeType.CSV_EXPORT, new CsvExportNodeHandler());
    this.handlers.set(NodeType.LOOP, new LoopNodeHandler());
    this.handlers.set(NodeType.ERROR_TRIGGER, new ErrorTriggerNodeHandler());
    this.handlers.set(NodeType.SLACK, new SlackNodeHandler());
    this.handlers.set(NodeType.DISCORD, new DiscordNodeHandler());
    this.handlers.set(NodeType.GITHUB, new GitHubNodeHandler());
    this.handlers.set(NodeType.GOOGLE_SHEETS, new GoogleSheetsNodeHandler());
    this.handlers.set(NodeType.STRIPE, new StripeNodeHandler());
    this.handlers.set(NodeType.TELEGRAM, new TelegramNodeHandler());
    this.handlers.set(NodeType.TWILIO, new TwilioNodeHandler());

    // Register new integration handlers (will override old ones)
    this.handlers.set(NodeType.GOOGLE_SHEETS, new GoogleSheetsHandler());
    this.handlers.set(NodeType.SLACK, new SlackHandler());
    this.handlers.set(NodeType.OPENAI, new OpenAIHandler());
    this.handlers.set(NodeType.STRIPE, new StripeHandler());
    this.handlers.set(NodeType.NOTION, new NotionHandler());
    this.handlers.set(NodeType.AIRTABLE, new AirtableHandler());
    this.handlers.set(NodeType.GITHUB, new GitHubHandler());
    this.handlers.set(NodeType.GMAIL, new GmailHandler());
    this.handlers.set(NodeType.GOOGLE_DRIVE, new GoogleDriveHandler());
    this.handlers.set(NodeType.GOOGLE_CALENDAR, new GoogleCalendarHandler());
    this.handlers.set(NodeType.DISCORD, new DiscordHandler());
    this.handlers.set(NodeType.TELEGRAM, new TelegramHandler());
    this.handlers.set(NodeType.TWILIO, new TwilioHandler());
    this.handlers.set(NodeType.GITLAB, new GitLabHandler());
    this.handlers.set(NodeType.PAYPAL, new PayPalHandler());
    this.handlers.set(NodeType.TRELLO, new TrelloHandler());
    this.handlers.set(NodeType.ASANA, new AsanaHandler());
    this.handlers.set(NodeType.ANTHROPIC, new AnthropicHandler());
    this.handlers.set(NodeType.SEND_SMS, new SendSMSHandler());
    this.handlers.set(NodeType.SEND_EMAIL, new SendEmailHandler());
    this.handlers.set(NodeType.HTTP_REQUEST, new HTTPRequestHandler());
    this.handlers.set(NodeType.DATABASE_QUERY, new DatabaseQueryHandler());
    this.handlers.set(NodeType.DATABASE_INSERT, new DatabaseInsertHandler());
    this.handlers.set(NodeType.DATABASE_UPDATE, new DatabaseUpdateHandler());
    this.handlers.set(NodeType.CONDITION, new ConditionHandler());
    this.handlers.set(NodeType.LOOP, new LoopHandler());
    this.handlers.set(NodeType.DELAY, new DelayHandler());
    this.handlers.set(NodeType.TRANSFORM, new TransformHandler());
    this.handlers.set(NodeType.CSV_IMPORT, new CSVImportHandler());
    this.handlers.set(NodeType.CSV_EXPORT, new CSVExportHandler());
    this.handlers.set(NodeType.SCHEDULE, new ScheduleHandler());
    this.handlers.set(NodeType.WEBHOOK, new WebhookHandler());
    this.handlers.set(NodeType.DATABASE_WATCH, new DatabaseWatchHandler());
    this.handlers.set(NodeType.ERROR_TRIGGER, new ErrorTriggerHandler());
  }

  /**
   * Executes a node
   */
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const handler = this.handlers.get(node.type);

    if (!handler) {
      logger.warn('No handler for node type', { nodeType: node.type });
      throw new WorkflowExecutionError(`No handler for node type: ${node.type}`, undefined, node.id);
    }

    try {
      logger.debug('Executing node', {
        nodeId: node.id,
        nodeType: node.type,
        nodeName: node.name,
      });

      const result = await handler.execute(node, context);

      logger.debug('Node execution completed', {
        nodeId: node.id,
        nodeType: node.type,
      });

      return result;
    } catch (error) {
      logger.error('Node execution failed', {
        nodeId: node.id,
        nodeType: node.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new WorkflowExecutionError(
        `Node execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        node.id
      );
    }
  }
}

/**
 * Base interface for node handlers
 */
export interface NodeHandler {
  execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown>;
}

