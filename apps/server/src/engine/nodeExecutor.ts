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
import { ConditionNodeHandler } from './nodes/conditionNode';
import { AIGenerateNodeHandler } from './nodes/aiGenerateNode';
import { WebhookNodeHandler } from './nodes/webhookNode';
import { HttpRequestNodeHandler } from './nodes/httpRequestNode';
import { CsvImportNodeHandler } from './nodes/csvImportNode';
import { CsvExportNodeHandler } from './nodes/csvExportNode';

export class NodeExecutor {
  private handlers: Map<NodeType, NodeHandler>;

  constructor() {
    // Register node handlers
    this.handlers = new Map();
    this.handlers.set(NodeType.SCHEDULE, new ScheduleNodeHandler());
    this.handlers.set(NodeType.SEND_SMS, new SMSNodeHandler());
    this.handlers.set(NodeType.SEND_EMAIL, new EmailNodeHandler());
    this.handlers.set(NodeType.DATABASE_QUERY, new DatabaseQueryNodeHandler());
    this.handlers.set(NodeType.CONDITION, new ConditionNodeHandler());
    this.handlers.set(NodeType.AI_GENERATE, new AIGenerateNodeHandler());
    this.handlers.set(NodeType.WEBHOOK, new WebhookNodeHandler());
    this.handlers.set(NodeType.HTTP_REQUEST, new HttpRequestNodeHandler());
    this.handlers.set(NodeType.CSV_IMPORT, new CsvImportNodeHandler());
    this.handlers.set(NodeType.CSV_EXPORT, new CsvExportNodeHandler());
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

