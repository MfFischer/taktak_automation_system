/**
 * Execution service
 * Handles workflow execution tracking and management
 */

import { WorkflowExecution, ExecutionStatus } from '@taktak/types';

import { getLocalDatabase } from '../database/pouchdb';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class ExecutionService {
  private db = getLocalDatabase();

  /**
   * Lists executions with optional filters
   */
  async listExecutions(options: {
    workflowId?: string;
    status?: ExecutionStatus;
    page: number;
    limit: number;
  }): Promise<{ executions: WorkflowExecution[]; total: number }> {
    const { workflowId, status, page, limit } = options;
    const skip = (page - 1) * limit;

    try {
      const selector: Record<string, unknown> = {
        type: 'execution',
      };

      if (workflowId) {
        selector.workflowId = workflowId;
      }

      if (status) {
        selector.status = status;
      }

      const result = await this.db.find({
        selector,
        sort: [{ startedAt: 'desc' }],
        limit,
        skip,
      });

      const countResult = await this.db.find({
        selector,
        fields: ['_id'],
      });

      return {
        executions: result.docs as WorkflowExecution[],
        total: countResult.docs.length,
      };
    } catch (error) {
      logger.error('Failed to list executions', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Gets an execution by ID
   */
  async getExecutionById(id: string): Promise<WorkflowExecution> {
    try {
      const execution = await this.db.get(id);

      if ((execution as WorkflowExecution).type !== 'execution') {
        throw new NotFoundError('Execution');
      }

      return execution as WorkflowExecution;
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        throw new NotFoundError('Execution');
      }
      throw error;
    }
  }

  /**
   * Cancels a running execution
   */
  async cancelExecution(id: string): Promise<WorkflowExecution> {
    const execution = await this.getExecutionById(id);

    if (execution.status !== ExecutionStatus.RUNNING) {
      throw new Error('Can only cancel running executions');
    }

    const updated: WorkflowExecution = {
      ...execution,
      status: ExecutionStatus.CANCELLED,
      completedAt: new Date().toISOString(),
    };

    try {
      const response = await this.db.put(updated);
      logger.info('Execution cancelled', { executionId: id });

      return {
        ...updated,
        _rev: response.rev,
      };
    } catch (error) {
      logger.error('Failed to cancel execution', {
        executionId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Retries a failed execution
   */
  async retryExecution(id: string): Promise<WorkflowExecution> {
    const execution = await this.getExecutionById(id);

    if (execution.status !== ExecutionStatus.FAILED) {
      throw new Error('Can only retry failed executions');
    }

    // Create a new execution based on the failed one
    const newExecution: WorkflowExecution = {
      _id: `execution:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      type: 'execution',
      workflowId: execution.workflowId,
      workflowName: execution.workflowName,
      status: ExecutionStatus.PENDING,
      startedAt: new Date().toISOString(),
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Retrying failed execution ${id}`,
        },
      ],
    };

    try {
      const response = await this.db.put(newExecution);
      logger.info('Execution retry created', {
        originalId: id,
        newId: newExecution._id,
      });

      return {
        ...newExecution,
        _rev: response.rev,
      };
    } catch (error) {
      logger.error('Failed to retry execution', {
        executionId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Deletes an execution
   */
  async deleteExecution(id: string): Promise<void> {
    const execution = await this.getExecutionById(id);

    try {
      await this.db.remove(execution as any);
      logger.info('Execution deleted', { executionId: id });
    } catch (error) {
      logger.error('Failed to delete execution', {
        executionId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

