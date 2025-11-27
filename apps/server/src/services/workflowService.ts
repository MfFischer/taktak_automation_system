/**
 * Workflow service
 * Handles workflow CRUD operations and execution
 */

import { Workflow, WorkflowStatus, WorkflowVersion } from '@taktak/types';

import { getLocalDatabase } from '../database/pouchdb';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { WorkflowEngine } from '../engine/workflowEngine';

export class WorkflowService {
  private db: PouchDB.Database;
  private engine = new WorkflowEngine();

  // Store the promise to ensure indexes are created before queries
  // @ts-ignore - Used for side effects
  private indexesCreated: Promise<void>;

  constructor(database?: PouchDB.Database) {
    // Use provided database or get the default local database
    this.db = database || getLocalDatabase();

    // Create indexes and store the promise
    this.indexesCreated = this.createIndexes();
  }

  /**
   * Create database indexes for efficient querying
   */
  private async createIndexes(): Promise<void> {
    try {
      // Index for workflows
      await this.db.createIndex({
        index: {
          fields: ['type', 'userId', 'createdAt'],
        },
      });

      // Index for workflow versions (needed for sorting by version)
      await this.db.createIndex({
        index: {
          fields: ['type', 'workflowId', 'version'],
        },
      });

      logger.debug('Workflow indexes created');
    } catch (error) {
      // Index might already exist, ignore error
      logger.debug('Workflow indexes already exist or failed to create');
    }
  }

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
      version: 1, // Initial version
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await this.db.put(workflow);
      logger.info('Workflow created', { workflowId: workflow._id });

      // Create initial version snapshot
      await this.createWorkflowVersion(workflow._id, 'Initial version');

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
    userId?: string;
  }): Promise<{ workflows: Workflow[]; total: number }> {
    const { status, tags, page, limit, userId } = options;
    const skip = (page - 1) * limit;

    try {
      // Build query
      const selector: Record<string, unknown> = {
        type: 'workflow',
      };

      // Filter by userId if provided (for user-specific workflows)
      if (userId) {
        selector.userId = userId;
      }

      if (status) {
        selector.status = status;
      }

      if (tags && tags.length > 0) {
        selector.tags = { $in: tags };
      }

      const result = await this.db.find({
        selector,
        limit,
        skip,
      });

      // Sort in memory since PouchDB doesn't have the index yet
      const sortedDocs = (result.docs as Workflow[]).sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      // Get total count
      const countResult = await this.db.find({
        selector,
        fields: ['_id'],
      });

      return {
        workflows: sortedDocs,
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
   * Count active workflows for a user
   */
  async countActiveWorkflows(userId: string): Promise<number> {
    try {
      const result = await this.db.find({
        selector: {
          type: 'workflow',
          userId,
          status: WorkflowStatus.ACTIVE,
        },
        fields: ['_id'],
      });

      return result.docs.length;
    } catch (error) {
      logger.error('Failed to count active workflows', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 0;
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
    data: Partial<Omit<Workflow, '_id' | '_rev' | 'type' | 'createdAt'>>,
    createVersion: boolean = true
  ): Promise<Workflow> {
    const existing = await this.getWorkflowById(id);

    if (data.nodes || data.connections) {
      this.validateWorkflowStructure({
        ...existing,
        ...data,
      } as Workflow);
    }

    // Increment version if significant changes
    const shouldIncrementVersion = createVersion && (data.nodes || data.connections || data.trigger);
    const newVersion = shouldIncrementVersion ? (existing.version || 1) + 1 : existing.version;

    const updated: Workflow = {
      ...existing,
      ...data,
      version: newVersion,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await this.db.put(updated);
      logger.info('Workflow updated', { workflowId: id, version: newVersion });

      // Create version snapshot if significant changes
      if (shouldIncrementVersion) {
        await this.createWorkflowVersion(id, data.metadata?.changeDescription as string);
      }

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

    // Auto-activate workflow on first execution if it's in draft status
    if (workflow.status === WorkflowStatus.DRAFT) {
      logger.info('Auto-activating workflow on first execution', { workflowId: id });
      const activatedWorkflow = await this.updateWorkflowStatus(id, WorkflowStatus.ACTIVE);
      return this.engine.executeWorkflow(activatedWorkflow, input);
    }

    // Check if workflow is in a valid state for execution
    if (workflow.status === WorkflowStatus.DISABLED) {
      throw new ValidationError('Cannot execute disabled workflow. Please enable it first.');
    }

    if (workflow.status === WorkflowStatus.PAUSED) {
      throw new ValidationError('Cannot execute paused workflow. Please resume it first.');
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

  // ============================================
  // Workflow Versioning Methods
  // ============================================

  /**
   * Creates a version snapshot of a workflow
   */
  async createWorkflowVersion(workflowId: string, changeDescription?: string): Promise<WorkflowVersion> {
    const workflow = await this.getWorkflowById(workflowId);
    const currentVersion = workflow.version || 1;

    const version: WorkflowVersion = {
      _id: `workflow_version:${workflowId}:${currentVersion}:${Date.now()}`,
      type: 'workflow_version',
      workflowId,
      version: currentVersion,
      snapshot: workflow,
      createdAt: new Date().toISOString(),
      createdBy: workflow.createdBy || workflow.userId,
      changeDescription,
    };

    try {
      await this.db.put(version);
      logger.info('Workflow version created', { workflowId, version: currentVersion });
      return version;
    } catch (error) {
      logger.error('Failed to create workflow version', {
        workflowId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Lists all versions of a workflow
   */
  async listWorkflowVersions(workflowId: string): Promise<WorkflowVersion[]> {
    try {
      const result = await this.db.find({
        selector: {
          type: 'workflow_version',
          workflowId,
        },
      });

      // Sort in memory instead of using database sort (avoids index issues)
      const versions = result.docs as WorkflowVersion[];
      return versions.sort((a, b) => (b.version || 0) - (a.version || 0));
    } catch (error) {
      logger.error('Failed to list workflow versions', {
        workflowId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Gets a specific workflow version
   */
  async getWorkflowVersion(versionId: string): Promise<WorkflowVersion> {
    try {
      const version = await this.db.get<WorkflowVersion>(versionId);

      if (version.type !== 'workflow_version') {
        throw new NotFoundError('Workflow version not found');
      }

      return version;
    } catch (error) {
      if ((error as any).status === 404) {
        throw new NotFoundError('Workflow version not found');
      }
      throw error;
    }
  }

  /**
   * Rolls back a workflow to a specific version
   */
  async rollbackToVersion(workflowId: string, versionId: string): Promise<Workflow> {
    const version = await this.getWorkflowVersion(versionId);

    if (version.workflowId !== workflowId) {
      throw new ValidationError('Version does not belong to this workflow');
    }

    // Create a backup of current state before rollback
    await this.createWorkflowVersion(workflowId, 'Backup before rollback');

    // Restore the snapshot (excluding _id and _rev)
    const { _id, _rev, createdAt, ...snapshotData } = version.snapshot;

    const rolledBack = await this.updateWorkflow(
      workflowId,
      {
        ...snapshotData,
        metadata: {
          ...snapshotData.metadata,
          changeDescription: `Rolled back to version ${version.version}`,
        },
      },
      false // Don't create another version during rollback
    );

    logger.info('Workflow rolled back', {
      workflowId,
      toVersion: version.version,
      fromVersion: rolledBack.version
    });

    return rolledBack;
  }

  /**
   * Deletes old versions (keep last N versions)
   */
  async pruneWorkflowVersions(workflowId: string, keepCount: number = 10): Promise<number> {
    const versions = await this.listWorkflowVersions(workflowId);

    if (versions.length <= keepCount) {
      return 0;
    }

    const toDelete = versions.slice(keepCount);
    let deletedCount = 0;

    for (const version of toDelete) {
      try {
        await this.db.remove(version as any);
        deletedCount++;
      } catch (error) {
        logger.warn('Failed to delete workflow version', {
          versionId: version._id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info('Pruned workflow versions', { workflowId, deletedCount });
    return deletedCount;
  }

  /**
   * Get all workflows for a specific user (for GDPR data export)
   */
  async getWorkflowsByUser(userId: string): Promise<Workflow[]> {
    const { workflows } = await this.listWorkflows({
      userId,
      page: 1,
      limit: 10000, // Get all workflows
    });
    return workflows;
  }
}

