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
  private db: PouchDB.Database;
  private nodeExecutor = new NodeExecutor();

  constructor(database?: PouchDB.Database) {
    // Use provided database or get the default local database
    this.db = database || getLocalDatabase();
  }

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
      const saveResult = await this.db.put(execution);
      execution._rev = saveResult.rev; // Update _rev for future updates
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

    // Save final execution state with updated _rev
    try {
      const finalSaveResult = await this.db.put(execution);
      execution._rev = finalSaveResult.rev;
    } catch (error) {
      // If save fails, log but don't throw - execution already completed
      logger.warn('Failed to save final execution state', {
        executionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return execution;
  }

  /**
   * Executes a single node with retry and error handling support
   */
  private async executeNode(
    workflow: Workflow,
    node: Workflow['nodes'][0],
    execution: WorkflowExecution,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<void> {
    this.addLog(execution, 'info', `Executing node: ${node.name}`, node.id);
    logNodeExecution(workflow._id, execution._id, node.id, node.type, 'started');

    // Get execution configuration
    const execConfig = node.executionConfig || {};
    const maxRetries = execConfig.retries || 0;
    const retryDelay = execConfig.retryDelay || 1000;
    const timeout = execConfig.timeout || 30000;
    const continueOnError = execConfig.continueOnError || false;

    let lastError: Error | null = null;
    let attempt = 0;

    // Retry loop
    while (attempt <= maxRetries) {
      try {
        // Execute with timeout
        const result = await this.executeWithTimeout(
          () => this.nodeExecutor.execute(node, context),
          timeout,
          node.name
        );

        // Store result in context
        context.variables[node.id] = result;

        this.addLog(execution, 'info', `Node completed: ${node.name}`, node.id);
        logNodeExecution(workflow._id, execution._id, node.id, node.type, 'completed');

        // Find and execute next nodes
        await this.executeNextNodes(workflow, node, execution, context);

        return; // Success, exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        attempt++;

        if (attempt <= maxRetries) {
          this.addLog(
            execution,
            'warn',
            `Node failed (attempt ${attempt}/${maxRetries + 1}), retrying in ${retryDelay}ms...`,
            node.id
          );
          await this.delay(retryDelay);
        }
      }
    }

    // All retries exhausted
    this.addLog(
      execution,
      'error',
      `Node failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
      node.id
    );
    logNodeExecution(workflow._id, execution._id, node.id, node.type, 'failed', {
      error: lastError?.message,
      attempts: maxRetries + 1,
    });

    // Check if we should continue despite error
    if (continueOnError) {
      this.addLog(execution, 'warn', `Continuing workflow despite node failure`, node.id);

      // Store error in context for error trigger nodes
      context.variables.$error = lastError;
      context.variables.$failedNode = node;

      // Trigger error handlers
      await this.triggerErrorHandlers(workflow, node, lastError!, execution, context);

      // Continue to next nodes
      await this.executeNextNodes(workflow, node, execution, context);
      return;
    }

    // Trigger error handlers before throwing
    await this.triggerErrorHandlers(workflow, node, lastError!, execution, context);

    throw new WorkflowExecutionError(
      `Node execution failed: ${node.name}`,
      workflow._id,
      node.id
    );
  }

  /**
   * Executes next nodes in the workflow
   */
  private async executeNextNodes(
    workflow: Workflow,
    node: Workflow['nodes'][0],
    execution: WorkflowExecution,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<void> {
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
  }

  /**
   * Triggers error handler nodes
   */
  private async triggerErrorHandlers(
    workflow: Workflow,
    failedNode: Workflow['nodes'][0],
    error: Error,
    execution: WorkflowExecution,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<void> {
    // Find error trigger nodes
    const errorTriggers = workflow.nodes.filter((n) => n.type === 'error_trigger');

    if (errorTriggers.length === 0) {
      return;
    }

    // Create error context
    const errorContext = {
      ...context,
      variables: {
        ...context.variables,
        $error: error,
        $failedNode: failedNode,
        $workflowId: workflow._id,
        $executionId: execution._id,
      },
    };

    // Execute error trigger nodes
    for (const errorTrigger of errorTriggers) {
      try {
        await this.nodeExecutor.execute(errorTrigger, errorContext);
        this.addLog(execution, 'info', `Error trigger executed: ${errorTrigger.name}`);
      } catch (triggerError) {
        this.addLog(
          execution,
          'error',
          `Error trigger failed: ${triggerError instanceof Error ? triggerError.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Executes a function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    nodeName: string
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Node execution timeout: ${nodeName}`)), timeoutMs)
      ),
    ]);
  }

  /**
   * Delays execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Evaluates a condition expression
   * Supports simple comparisons: eq, ne, gt, gte, lt, lte, contains
   * Format: "variable operator value" or JSON condition object
   */
  private evaluateCondition(
    condition: string,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): boolean {
    try {
      logger.debug('Evaluating condition', { condition });

      // Try to parse as JSON condition object
      let conditionObj: any;
      try {
        conditionObj = JSON.parse(condition);
      } catch {
        // If not JSON, treat as simple expression
        return this.evaluateSimpleExpression(condition, context);
      }

      // Handle structured condition object
      if (conditionObj.field && conditionObj.operator && 'value' in conditionObj) {
        return this.evaluateComparison(
          conditionObj.field,
          conditionObj.operator,
          conditionObj.value,
          context
        );
      }

      // Handle multiple conditions with logic
      if (conditionObj.conditions && Array.isArray(conditionObj.conditions)) {
        const logic = conditionObj.logic || 'and';
        const results = conditionObj.conditions.map((cond: any) =>
          this.evaluateComparison(cond.field, cond.operator, cond.value, context)
        );

        return logic === 'and' ? results.every(Boolean) : results.some(Boolean);
      }

      logger.warn('Invalid condition format', { condition });
      return false;
    } catch (error) {
      logger.error('Condition evaluation failed', {
        condition,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Evaluates a simple expression like "status == 'active'"
   */
  private evaluateSimpleExpression(
    expression: string,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): boolean {
    // Simple regex-based parsing for basic expressions
    const match = expression.match(/^(\w+)\s*(==|!=|>|>=|<|<=|contains)\s*(.+)$/);
    if (!match) {
      logger.warn('Could not parse simple expression', { expression });
      return false;
    }

    const [, field, operator, valueStr] = match;
    const value = valueStr.trim().replace(/^['"]|['"]$/g, ''); // Remove quotes

    return this.evaluateComparison(field, operator, value, context);
  }

  /**
   * Evaluates a single comparison
   */
  private evaluateComparison(
    field: string,
    operator: string,
    expectedValue: unknown,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): boolean {
    // Get actual value from context
    const actualValue = this.resolveFieldValue(field, context);

    switch (operator) {
      case 'eq':
      case '==':
        return actualValue == expectedValue;

      case 'ne':
      case '!=':
        return actualValue != expectedValue;

      case 'gt':
      case '>':
        return Number(actualValue) > Number(expectedValue);

      case 'gte':
      case '>=':
        return Number(actualValue) >= Number(expectedValue);

      case 'lt':
      case '<':
        return Number(actualValue) < Number(expectedValue);

      case 'lte':
      case '<=':
        return Number(actualValue) <= Number(expectedValue);

      case 'contains':
        return String(actualValue).includes(String(expectedValue));

      case 'regex': {
        const regex = new RegExp(String(expectedValue));
        return regex.test(String(actualValue));
      }

      default:
        logger.warn('Unknown operator', { operator });
        return false;
    }
  }

  /**
   * Resolves a field value from context
   * Supports dot notation: "input.user.name" or "variables.nodeId.result"
   */
  private resolveFieldValue(
    field: string,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): unknown {
    const parts = field.split('.');
    let value: any = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
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

