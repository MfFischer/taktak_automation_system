/**
 * Workflow service
 * Handles workflow CRUD operations and execution
 */

import { Workflow, WorkflowStatus } from '@taktak/types';

import { getLocalDatabase } from '../database/pouchdb';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { WorkflowEngine } from '../engine/workflowEngine';

export class WorkflowService {
  private db = getLocalDatabase();
  private engine = new WorkflowEngine();

  /**
   * Creates a new workflow
   */
  async createWorkflow(data: Omit<Workflow, '_id' | '_rev' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    // Validate workflow structure
    this.validateWorkflowStructure(data);

    const workflow: Workflow = {
      _id: `workflow:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      type: 'workflow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await this.db.put(workflow);
      logger.info('Workflow created', { workflowId: workflow._id });

      return {
        ...workflow,
        _rev: response.rev,
      };
    } catch (error) {
      logger.error('Failed to create workflow', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Lists workflows with optional filters
   */
  async listWorkflows(options: {
    status?: WorkflowStatus;
    tags?: string[];
    page: number;
    limit: number;
  }): Promise<{ workflows: Workflow[]; total: number }> {
    const { status, tags, page, limit } = options;
    const skip = (page - 1) * limit;

    try {
      // Build query
      const selector: Record<string, unknown> = {
        type: 'workflow',
      };

      if (status) {
        selector.status = status;
      }

      if (tags && tags.length > 0) {
        selector.tags = { $in: tags };
      }

      const result = await this.db.find({
        selector,
        sort: [{ createdAt: 'desc' }],
        limit,
        skip,
      });

      // Get total count
      const countResult = await this.db.find({
        selector,
        fields: ['_id'],
      });

      return {
        workflows: result.docs as Workflow[],
        total: countResult.docs.length,
      };
    } catch (error) {
      logger.error('Failed to list workflows', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Gets a workflow by ID
   */
  async getWorkflowById(id: string): Promise<Workflow> {
    try {
      const workflow = await this.db.get(id);

      if ((workflow as Workflow).type !== 'workflow') {
        throw new NotFoundError('Workflow');
      }

      return workflow as Workflow;
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        throw new NotFoundError('Workflow');
      }
      throw error;
    }
  }

  /**
   * Updates a workflow
   */
  async updateWorkflow(
    id: string,
    data: Partial<Omit<Workflow, '_id' | '_rev' | 'type' | 'createdAt'>>
  ): Promise<Workflow> {
    const existing = await this.getWorkflowById(id);

    if (data.nodes || data.connections) {
      this.validateWorkflowStructure({
        ...existing,
        ...data,
      } as Workflow);
    }

    const updated: Workflow = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await this.db.put(updated);
      logger.info('Workflow updated', { workflowId: id });

      return {
        ...updated,
        _rev: response.rev,
      };
    } catch (error) {
      logger.error('Failed to update workflow', {
        workflowId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Updates workflow status
   */
  async updateWorkflowStatus(id: string, status: WorkflowStatus): Promise<Workflow> {
    return this.updateWorkflow(id, { status });
  }

  /**
   * Deletes a workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    const workflow = await this.getWorkflowById(id);

    try {
      await this.db.remove(workflow as any);
      logger.info('Workflow deleted', { workflowId: id });
    } catch (error) {
      logger.error('Failed to delete workflow', {
        workflowId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Executes a workflow
   */
  async executeWorkflow(id: string, input?: Record<string, unknown>) {
    const workflow = await this.getWorkflowById(id);

    if (workflow.status !== WorkflowStatus.ACTIVE) {
      throw new ValidationError('Workflow must be active to execute');
    }

    logger.info('Executing workflow', { workflowId: id });

    return this.engine.executeWorkflow(workflow, input);
  }

  /**
   * Validates workflow structure
   */
  private validateWorkflowStructure(workflow: Partial<Workflow>): void {
    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new ValidationError('Workflow must have at least one node');
    }

    if (!workflow.trigger) {
      throw new ValidationError('Workflow must have a trigger node');
    }

    // Validate that trigger node exists in nodes
    const triggerExists = workflow.nodes.some((node) => node.id === workflow.trigger?.id);
    if (!triggerExists) {
      throw new ValidationError('Trigger node must exist in workflow nodes');
    }

    // Validate connections reference existing nodes
    if (workflow.connections) {
      const nodeIds = new Set(workflow.nodes.map((node) => node.id));

      for (const conn of workflow.connections) {
        if (!nodeIds.has(conn.from)) {
          throw new ValidationError(`Connection references non-existent node: ${conn.from}`);
        }
        if (!nodeIds.has(conn.to)) {
          throw new ValidationError(`Connection references non-existent node: ${conn.to}`);
        }
      }
    }
  }
}

