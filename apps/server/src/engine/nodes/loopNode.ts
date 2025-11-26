/**
 * Loop node handler
 * Iterates over arrays and executes child nodes for each item
 */

import { WorkflowNode, LoopNodeConfig } from '@taktak/types';

import { NodeHandler } from '../nodeExecutor';
import { logger } from '../../utils/logger';
import { ValidationError, WorkflowExecutionError } from '../../utils/errors';

export class LoopNodeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const config = node.config as unknown as LoopNodeConfig;

    logger.info('Starting loop execution', {
      nodeId: node.id,
      nodeName: node.name,
    });

    try {
      // Resolve items to iterate over
      const items = this.resolveItems(config.items, context);

      if (!Array.isArray(items)) {
        throw new ValidationError('Loop items must be an array');
      }

      if (items.length === 0) {
        logger.info('Loop has no items to process', { nodeId: node.id });
        return { items: [], count: 0 };
      }

      // Apply safety limit
      const maxIterations = config.maxIterations || 1000;
      if (items.length > maxIterations) {
        throw new ValidationError(
          `Loop exceeds maximum iterations limit: ${items.length} > ${maxIterations}`
        );
      }

      const batchSize = config.batchSize || 1;
      const results: unknown[] = [];
      const errors: Array<{ index: number; error: string }> = [];

      // Process items in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, Math.min(i + batchSize, items.length));

        for (let j = 0; j < batch.length; j++) {
          const index = i + j;
          const item = batch[j];

          try {
            // Create loop context with special variables
            const loopContext = {
              ...context,
              variables: {
                ...context.variables,
                $item: item, // Current item
                $index: index, // Current index (0-based)
                $iteration: index + 1, // Current iteration (1-based)
                $length: items.length, // Total number of items
                $isFirst: index === 0, // Is first item
                $isLast: index === items.length - 1, // Is last item
              },
            };

            // Execute with loop context
            // Note: In a full implementation, this would execute child nodes
            // For now, we just pass through the item
            const result = await this.processItem(item, loopContext);
            results.push(result);

            logger.debug('Loop item processed', {
              nodeId: node.id,
              index,
              iteration: index + 1,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            logger.warn('Loop item failed', {
              nodeId: node.id,
              index,
              error: errorMessage,
            });

            errors.push({ index, error: errorMessage });

            // Stop loop if continueOnItemError is false
            if (!config.continueOnItemError) {
              throw new WorkflowExecutionError(
                `Loop failed at item ${index}: ${errorMessage}`,
                undefined,
                node.id
              );
            }

            // Add null result for failed item
            results.push(null);
          }
        }
      }

      logger.info('Loop execution completed', {
        nodeId: node.id,
        totalItems: items.length,
        successCount: results.filter((r) => r !== null).length,
        errorCount: errors.length,
      });

      return {
        items: results,
        count: results.length,
        successCount: results.filter((r) => r !== null).length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      logger.error('Loop execution failed', {
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Resolves items from config or context
   */
  private resolveItems(
    items: string | unknown[],
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): unknown[] {
    // If items is already an array, return it
    if (Array.isArray(items)) {
      return items;
    }

    // If items is a string, try to resolve it as an expression
    if (typeof items === 'string') {
      // Handle expressions like "{{$json.items}}" or "{{$node.previousNode.items}}"
      const expressionMatch = items.match(/^\{\{(.+)\}\}$/);
      
      if (expressionMatch) {
        const expression = expressionMatch[1].trim();
        return this.evaluateExpression(expression, context);
      }

      // If not an expression, treat as a direct variable reference
      return this.evaluateExpression(items, context);
    }

    throw new ValidationError('Loop items must be an array or expression');
  }

  /**
   * Evaluates an expression in the context
   */
  private evaluateExpression(
    expression: string,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): unknown[] {
    // Handle $json reference (current input)
    if (expression.startsWith('$json.')) {
      const path = expression.substring(6);
      return this.getNestedValue(context.input, path);
    }

    // Handle $input reference
    if (expression.startsWith('$input.')) {
      const path = expression.substring(7);
      return this.getNestedValue(context.input, path);
    }

    // Handle $node reference (previous node output)
    if (expression.startsWith('$node.')) {
      const parts = expression.substring(6).split('.');
      const nodeId = parts[0];
      const path = parts.slice(1).join('.');
      
      const nodeOutput = context.variables[nodeId];
      if (!nodeOutput) {
        throw new ValidationError(`Node output not found: ${nodeId}`);
      }
      
      return path ? this.getNestedValue(nodeOutput as Record<string, unknown>, path) : (nodeOutput as unknown[]);
    }

    // Try to get from variables directly
    const value = context.variables[expression];
    if (value !== undefined) {
      return value as unknown[];
    }

    throw new ValidationError(`Cannot resolve expression: ${expression}`);
  }

  /**
   * Gets a nested value from an object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown[] {
    const parts = path.split('.');
    let current: any = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        throw new ValidationError(`Cannot access property '${part}' of ${current}`);
      }
      current = current[part];
    }

    if (!Array.isArray(current)) {
      throw new ValidationError(`Value at path '${path}' is not an array`);
    }

    return current;
  }

  /**
   * Processes a single item
   * In a full implementation, this would execute child nodes
   */
  private async processItem(
    item: unknown,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    // For now, just return the item with loop context
    // In a full implementation, this would execute child nodes connected to the loop
    return {
      item,
      processed: true,
      context: {
        index: context.variables.$index,
        iteration: context.variables.$iteration,
      },
    };
  }
}

