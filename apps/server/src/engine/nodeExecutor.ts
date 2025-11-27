/**
 * Node executor
 * Executes individual workflow nodes based on their type
 *
 * All handlers are consolidated in the ./handlers directory.
 * Each handler implements the NodeHandler interface.
 */

import { WorkflowNode, NodeType, NODE_REGISTRY } from '@taktak/types';

import { logger } from '../utils/logger';
import { WorkflowExecutionError } from '../utils/errors';

// Import consolidated handlers (single source of truth)
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
import { AIGenerateHandler } from './handlers/AIGenerateHandler';

export class NodeExecutor {
  private handlers: Map<NodeType, NodeHandler>;

  constructor() {
    this.handlers = new Map();
    this.registerHandlers();
    this.logHandlerCoverage();
  }

  /**
   * Register all node handlers
   * Each NodeType should have exactly one handler
   */
  private registerHandlers(): void {
    // Triggers
    this.handlers.set(NodeType.SCHEDULE, new ScheduleHandler());
    this.handlers.set(NodeType.WEBHOOK, new WebhookHandler());
    this.handlers.set(NodeType.DATABASE_WATCH, new DatabaseWatchHandler());
    this.handlers.set(NodeType.ERROR_TRIGGER, new ErrorTriggerHandler());

    // Actions - Communication
    this.handlers.set(NodeType.SEND_SMS, new SendSMSHandler());
    this.handlers.set(NodeType.SEND_EMAIL, new SendEmailHandler());
    this.handlers.set(NodeType.HTTP_REQUEST, new HTTPRequestHandler());

    // Actions - Database
    this.handlers.set(NodeType.DATABASE_QUERY, new DatabaseQueryHandler());
    this.handlers.set(NodeType.DATABASE_INSERT, new DatabaseInsertHandler());
    this.handlers.set(NodeType.DATABASE_UPDATE, new DatabaseUpdateHandler());

    // Logic & Control Flow
    this.handlers.set(NodeType.CONDITION, new ConditionHandler());
    this.handlers.set(NodeType.LOOP, new LoopHandler());
    this.handlers.set(NodeType.DELAY, new DelayHandler());
    this.handlers.set(NodeType.TRANSFORM, new TransformHandler());

    // Data Processing
    this.handlers.set(NodeType.CSV_IMPORT, new CSVImportHandler());
    this.handlers.set(NodeType.CSV_EXPORT, new CSVExportHandler());

    // AI Providers
    this.handlers.set(NodeType.AI_GENERATE, new AIGenerateHandler());
    this.handlers.set(NodeType.OPENAI, new OpenAIHandler());
    this.handlers.set(NodeType.ANTHROPIC, new AnthropicHandler());

    // Google Workspace
    this.handlers.set(NodeType.GOOGLE_SHEETS, new GoogleSheetsHandler());
    this.handlers.set(NodeType.GMAIL, new GmailHandler());
    this.handlers.set(NodeType.GOOGLE_DRIVE, new GoogleDriveHandler());
    this.handlers.set(NodeType.GOOGLE_CALENDAR, new GoogleCalendarHandler());

    // Communication Platforms
    this.handlers.set(NodeType.SLACK, new SlackHandler());
    this.handlers.set(NodeType.DISCORD, new DiscordHandler());
    this.handlers.set(NodeType.TELEGRAM, new TelegramHandler());
    this.handlers.set(NodeType.TWILIO, new TwilioHandler());

    // Development & DevOps
    this.handlers.set(NodeType.GITHUB, new GitHubHandler());
    this.handlers.set(NodeType.GITLAB, new GitLabHandler());

    // Payments
    this.handlers.set(NodeType.STRIPE, new StripeHandler());
    this.handlers.set(NodeType.PAYPAL, new PayPalHandler());

    // Productivity
    this.handlers.set(NodeType.NOTION, new NotionHandler());
    this.handlers.set(NodeType.AIRTABLE, new AirtableHandler());
    this.handlers.set(NodeType.TRELLO, new TrelloHandler());
    this.handlers.set(NodeType.ASANA, new AsanaHandler());
  }

  /**
   * Log handler coverage against NODE_REGISTRY
   */
  private logHandlerCoverage(): void {
    const registeredTypes = Array.from(this.handlers.keys());
    const registryTypes = Object.keys(NODE_REGISTRY) as NodeType[];

    const missingHandlers = registryTypes.filter(
      (type) => !registeredTypes.includes(type) && NODE_REGISTRY[type].backendImplemented
    );

    if (missingHandlers.length > 0) {
      logger.warn('Missing handlers for registered node types', { missingHandlers });
    }

    logger.info('NodeExecutor initialized', {
      registeredHandlers: registeredTypes.length,
      totalNodeTypes: registryTypes.length,
    });
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

