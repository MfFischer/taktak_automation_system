/**
 * Unit tests for Error Trigger Node
 */

import { ErrorTriggerNodeHandler } from './errorTriggerNode';
import { NodeType, WorkflowNode } from '@taktak/types';

describe('ErrorTriggerNodeHandler', () => {
  let handler: ErrorTriggerNodeHandler;

  beforeEach(() => {
    handler = new ErrorTriggerNodeHandler();
  });

  describe('execute', () => {
    it('should execute successfully with valid config', async () => {
      const node: WorkflowNode = {
        id: 'error-trigger-1',
        type: NodeType.ERROR_TRIGGER,
        name: 'Error Handler',
        config: {
          errorTypes: ['validation', 'network'],
          notifyEmail: 'admin@example.com',
        },
      };

      const context = {
        input: {},
        variables: {},
      };

      const result = await handler.execute(node, context) as any;

      expect(result).toBeDefined();
      expect(result).toHaveProperty('triggered', false);
    });

    it('should filter errors by type', async () => {
      const node: WorkflowNode = {
        id: 'error-trigger-1',
        type: NodeType.ERROR_TRIGGER,
        name: 'Error Handler',
        config: {
          errorTypes: ['validation'],
          notifyEmail: 'admin@example.com',
        },
      };

      // Create a proper error object with constructor name
      class validation extends Error {}
      const error = new validation('Invalid input');

      const context = {
        input: {},
        variables: {
          $error: error,
          $failedNode: {
            id: 'failed-node',
            name: 'Failed Node',
            type: NodeType.HTTP_REQUEST,
          },
          $workflowId: 'test-workflow',
          $executionId: 'test-execution',
        },
      };

      const result = await handler.execute(node, context) as any;

      expect(result).toBeDefined();
      expect(result).toHaveProperty('triggered', true);
    });

    it('should handle all error types when not specified', async () => {
      const node: WorkflowNode = {
        id: 'error-trigger-1',
        type: NodeType.ERROR_TRIGGER,
        name: 'Error Handler',
        config: {
          notifyEmail: 'admin@example.com',
        },
      };

      const error = new Error('Something went wrong');

      const context = {
        input: {},
        variables: {
          $error: error,
          $failedNode: {
            id: 'failed-node',
            name: 'Failed Node',
            type: NodeType.HTTP_REQUEST,
          },
          $workflowId: 'test-workflow',
          $executionId: 'test-execution',
        },
      };

      const result = await handler.execute(node, context) as any;

      expect(result).toBeDefined();
      expect(result).toHaveProperty('triggered', true);
    });

    it('should include error context in result', async () => {
      const node: WorkflowNode = {
        id: 'error-trigger-1',
        type: NodeType.ERROR_TRIGGER,
        name: 'Error Handler',
        config: {
          errorTypes: ['network'],
          notifyEmail: 'admin@example.com',
        },
      };

      class network extends Error {
        code: string;
        constructor(message: string, code: string) {
          super(message);
          this.code = code;
        }
      }
      const error = new network('Connection timeout', 'ETIMEDOUT');

      const context = {
        input: {},
        variables: {
          $error: error,
          $failedNode: {
            id: 'http-1',
            name: 'API Call',
            type: NodeType.HTTP_REQUEST,
          },
          $workflowId: 'test-workflow',
          $executionId: 'test-execution',
        },
      };

      const result = await handler.execute(node, context) as any;

      expect(result).toBeDefined();
      expect(result.triggered).toBe(true);
      expect(result.error).toBeDefined();
    });

    it('should support multiple notification channels', async () => {
      const node: WorkflowNode = {
        id: 'error-trigger-1',
        type: NodeType.ERROR_TRIGGER,
        name: 'Error Handler',
        config: {
          errorTypes: ['server'],
          notifyEmail: 'admin@example.com',
          notifySMS: '+1234567890',
          notifySlack: 'https://hooks.slack.com/services/xxx',
        },
      };

      class server extends Error {
        statusCode: number;
        constructor(message: string, statusCode: number) {
          super(message);
          this.statusCode = statusCode;
        }
      }
      const error = new server('Internal server error', 500);

      const context = {
        input: {},
        variables: {
          $error: error,
          $failedNode: {
            id: 'failed-node',
            name: 'Failed Node',
            type: NodeType.HTTP_REQUEST,
          },
          $workflowId: 'test-workflow',
          $executionId: 'test-execution',
        },
      };

      const result = await handler.execute(node, context) as any;

      expect(result).toBeDefined();
      expect(result.triggered).toBe(true);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('error filtering', () => {
    it('should match error types correctly', async () => {
      const node: WorkflowNode = {
        id: 'error-trigger-1',
        type: NodeType.ERROR_TRIGGER,
        name: 'Error Handler',
        config: {
          errorTypes: ['validation', 'authentication'],
          notifyEmail: 'admin@example.com',
        },
      };

      class validation extends Error {}
      const validationError = new validation('Validation failed');

      class network extends Error {}
      const networkError = new network('Network error');

      const validationContext = {
        input: {},
        variables: {
          $error: validationError,
          $failedNode: {
            id: 'failed-node',
            name: 'Failed Node',
            type: NodeType.HTTP_REQUEST,
          },
          $workflowId: 'test-workflow',
          $executionId: 'test-execution',
        },
      };

      const networkContext = {
        input: {},
        variables: {
          $error: networkError,
          $failedNode: {
            id: 'failed-node',
            name: 'Failed Node',
            type: NodeType.HTTP_REQUEST,
          },
          $workflowId: 'test-workflow',
          $executionId: 'test-execution',
        },
      };

      const result1 = await handler.execute(node, validationContext) as any;
      expect(result1.triggered).toBe(true);

      // Network errors should not trigger this handler
      const result2 = await handler.execute(node, networkContext) as any;
      expect(result2.triggered).toBe(false);
    });
  });
});

