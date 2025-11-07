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

