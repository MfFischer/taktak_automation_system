/**
 * Error Trigger node handler
 * Triggered when errors occur in the workflow
 */

import { WorkflowNode, ErrorTriggerNodeConfig } from '@taktak/types';

import { NodeHandler } from '../nodeExecutor';
import { logger } from '../../utils/logger';

export class ErrorTriggerNodeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const config = node.config as unknown as ErrorTriggerNodeConfig;

    logger.info('Error trigger activated', {
      nodeId: node.id,
      nodeName: node.name,
    });

    try {
      // Extract error information from context
      const error = context.variables.$error as any;
      const failedNode = context.variables.$failedNode as any;
      const workflowId = context.variables.$workflowId as string;
      const executionId = context.variables.$executionId as string;

      // Check if this error should trigger this node
      if (!this.shouldTrigger(config, failedNode, error)) {
        logger.debug('Error trigger conditions not met', {
          nodeId: node.id,
          failedNodeId: failedNode?.id,
        });
        return { triggered: false };
      }

      // Prepare error information
      const errorInfo = {
        triggered: true,
        timestamp: new Date().toISOString(),
        workflowId,
        executionId,
        error: {
          message: error?.message || 'Unknown error',
          type: error?.constructor?.name || 'Error',
          stack: error?.stack,
        },
        failedNode: {
          id: failedNode?.id,
          name: failedNode?.name,
          type: failedNode?.type,
        },
      };

      logger.info('Error trigger executed', {
        nodeId: node.id,
        failedNodeId: failedNode?.id,
        errorType: errorInfo.error.type,
      });

      // Send notifications if configured
      if (config.notifyEmail) {
        await this.sendEmailNotification(config.notifyEmail, errorInfo);
      }

      if (config.notifySMS) {
        await this.sendSMSNotification(config.notifySMS, errorInfo);
      }

      return errorInfo;
    } catch (error) {
      logger.error('Error trigger execution failed', {
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Checks if this error should trigger this node
   */
  private shouldTrigger(
    config: ErrorTriggerNodeConfig,
    failedNode: any,
    error: any
  ): boolean {
    // If specific nodes are configured, check if failed node is in the list
    if (config.triggerOnNodes && config.triggerOnNodes.length > 0) {
      if (!failedNode || !config.triggerOnNodes.includes(failedNode.id)) {
        return false;
      }
    }

    // If specific error types are configured, check if error type matches
    if (config.errorTypes && config.errorTypes.length > 0) {
      const errorType = error?.constructor?.name || 'Error';
      if (!config.errorTypes.includes(errorType)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sends email notification about the error
   */
  private async sendEmailNotification(email: string, errorInfo: any): Promise<void> {
    try {
      logger.info('Sending error notification email', {
        to: email,
        workflowId: errorInfo.workflowId,
      });

      // In a full implementation, this would use the email service
      // For now, just log the notification
      logger.debug('Email notification would be sent', {
        to: email,
        subject: `Workflow Error: ${errorInfo.failedNode.name}`,
        body: `Error occurred in workflow ${errorInfo.workflowId}\n\nNode: ${errorInfo.failedNode.name}\nError: ${errorInfo.error.message}`,
      });
    } catch (error) {
      logger.warn('Failed to send error notification email', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Sends SMS notification about the error
   */
  private async sendSMSNotification(phone: string, errorInfo: any): Promise<void> {
    try {
      logger.info('Sending error notification SMS', {
        to: phone,
        workflowId: errorInfo.workflowId,
      });

      // In a full implementation, this would use the SMS service
      // For now, just log the notification
      logger.debug('SMS notification would be sent', {
        to: phone,
        message: `Workflow error in ${errorInfo.failedNode.name}: ${errorInfo.error.message}`,
      });
    } catch (error) {
      logger.warn('Failed to send error notification SMS', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

