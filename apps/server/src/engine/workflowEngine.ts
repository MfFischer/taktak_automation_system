/**
 * Workflow execution engine
 * Orchestrates workflow execution and node processing
 */

import { Workflow, WorkflowExecution, ExecutionStatus, ExecutionLog } from '@taktak/types';

import { getLocalDatabase } from '../database/pouchdb';
import { logger, logWorkflowExecution, logNodeExecution } from '../utils/logger';
import { WorkflowExecutionError } from '../utils/errors';
import { NodeExecutor } from './nodeExecutor';

export class WorkflowEngine {
  private db = getLocalDatabase();
  private nodeExecutor = new NodeExecutor();

  /**
   * Executes a workflow
   */
  async executeWorkflow(
    workflow: Workflow,
    input?: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    const executionId = `execution:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

    const execution: WorkflowExecution = {
      _id: executionId,
      type: 'execution',
      workflowId: workflow._id,
      workflowName: workflow.name,
      status: ExecutionStatus.RUNNING,
      startedAt: new Date().toISOString(),
      logs: [],
    };

    try {
      // Save initial execution
      await this.db.put(execution);
      logWorkflowExecution(workflow._id, executionId, 'started');

      this.addLog(execution, 'info', 'Workflow execution started');

      // Execute nodes starting from trigger
      const context = {
        input: input || {},
        variables: {} as Record<string, unknown>,
      };

      await this.executeNode(workflow, workflow.trigger, execution, context);

      // Mark as success
      execution.status = ExecutionStatus.SUCCESS;
      execution.completedAt = new Date().toISOString();
      execution.duration = Date.now() - new Date(execution.startedAt).getTime();

      this.addLog(execution, 'info', 'Workflow execution completed successfully');
      logWorkflowExecution(workflow._id, executionId, 'completed', {
        duration: execution.duration,
      });
    } catch (error) {
      // Mark as failed
      execution.status = ExecutionStatus.FAILED;
      execution.completedAt = new Date().toISOString();
      execution.duration = Date.now() - new Date(execution.startedAt).getTime();
      execution.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      };

      this.addLog(execution, 'error', `Workflow execution failed: ${execution.error.message}`);
      logWorkflowExecution(workflow._id, executionId, 'failed', {
        error: execution.error.message,
      });
    }

    // Save final execution state
    await this.db.put(execution);

    return execution;
  }

  /**
   * Executes a single node
   */
  private async executeNode(
    workflow: Workflow,
    node: Workflow['nodes'][0],
    execution: WorkflowExecution,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<void> {
    this.addLog(execution, 'info', `Executing node: ${node.name}`, node.id);
    logNodeExecution(workflow._id, execution._id, node.id, node.type, 'started');

    try {
      // Execute node
      const result = await this.nodeExecutor.execute(node, context);

      // Store result in context
      context.variables[node.id] = result;

      this.addLog(execution, 'info', `Node completed: ${node.name}`, node.id);
      logNodeExecution(workflow._id, execution._id, node.id, node.type, 'completed');

      // Find and execute next nodes
      const nextConnections = workflow.connections.filter((conn) => conn.from === node.id);

      for (const conn of nextConnections) {
        // Check condition if present
        if (conn.condition) {
          const conditionMet = this.evaluateCondition(conn.condition, context);
          if (!conditionMet) {
            this.addLog(execution, 'info', `Skipping connection due to condition: ${conn.condition}`);
            continue;
          }
        }

        // Find next node
        const nextNode = workflow.nodes.find((n) => n.id === conn.to);
        if (nextNode) {
          await this.executeNode(workflow, nextNode, execution, context);
        }
      }
    } catch (error) {
      this.addLog(
        execution,
        'error',
        `Node failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        node.id
      );
      logNodeExecution(workflow._id, execution._id, node.id, node.type, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new WorkflowExecutionError(
        `Node execution failed: ${node.name}`,
        workflow._id,
        node.id
      );
    }
  }

  /**
   * Evaluates a condition expression
   */
  private evaluateCondition(
    condition: string,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): boolean {
    try {
      // Simple condition evaluation
      // In production, use a safe expression evaluator
      // For now, just check if condition string is truthy
      logger.debug('Evaluating condition', { condition, context });
      return true; // TODO: Implement proper condition evaluation
    } catch (error) {
      logger.error('Condition evaluation failed', {
        condition,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Adds a log entry to execution
   */
  private addLog(
    execution: WorkflowExecution,
    level: ExecutionLog['level'],
    message: string,
    nodeId?: string
  ): void {
    execution.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      nodeId,
    });
  }
}

