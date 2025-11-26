/**
 * Tests for workflow engine error handling
 */

import { WorkflowEngine } from './workflowEngine';
import { Workflow, WorkflowStatus, NodeType, ExecutionStatus } from '@taktak/types';
import { createTestDatabase, destroyTestDatabase } from '../database/pouchdb';

describe('WorkflowEngine - Error Handling', () => {
  let engine: WorkflowEngine;
  let testDb: PouchDB.Database;

  beforeEach(() => {
    // Create a unique test database for each test
    testDb = createTestDatabase('engine_error_handling');
    engine = new WorkflowEngine(testDb);
  });

  afterEach(async () => {
    // Destroy the test database
    await destroyTestDatabase(testDb);
  });

  describe('Node retry logic', () => {
    it('should retry failed node based on executionConfig', async () => {
      const workflow: Workflow = {
        _id: 'workflow:test:retry',
        type: 'workflow',
        name: 'Retry Test Workflow',
        status: WorkflowStatus.ACTIVE,
        version: 1,
        nodes: [
          {
            id: 'trigger',
            type: NodeType.WEBHOOK,
            name: 'Webhook Trigger',
            config: { path: '/test', method: 'POST' as const },
          },
          {
            id: 'failing-node',
            type: NodeType.HTTP_REQUEST,
            name: 'Failing HTTP Request',
            config: {
              url: 'http://invalid-url-that-will-fail.test',
              method: 'GET',
            },
            executionConfig: {
              retries: 2,
              retryDelay: 100,
              continueOnError: false,
            },
          },
        ],
        connections: [
          { from: 'trigger', to: 'failing-node' },
        ],
        trigger: {
          id: 'trigger',
          type: NodeType.WEBHOOK,
          name: 'Webhook Trigger',
          config: { path: '/test', method: 'POST' as const },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const execution = await engine.executeWorkflow(workflow, {});

      // Should fail after retries
      expect(execution.status).toBe(ExecutionStatus.FAILED);

      // Check that execution has logs
      expect(execution.logs).toBeDefined();
      expect(execution.logs.length).toBeGreaterThan(0);
    });

    it('should continue workflow when continueOnError is true', async () => {
      const workflow: Workflow = {
        _id: 'workflow:test:continue',
        type: 'workflow',
        name: 'Continue On Error Test',
        status: WorkflowStatus.ACTIVE,
        version: 1,
        nodes: [
          {
            id: 'trigger',
            type: NodeType.WEBHOOK,
            name: 'Webhook Trigger',
            config: { path: '/test', method: 'POST' as const },
          },
          {
            id: 'failing-node',
            type: NodeType.HTTP_REQUEST,
            name: 'Failing HTTP Request',
            config: {
              url: 'http://invalid-url.test',
              method: 'GET',
            },
            executionConfig: {
              retries: 0,
              continueOnError: true,
            },
          },
          {
            id: 'success-node',
            type: NodeType.CONDITION,
            name: 'Success Node',
            config: {
              conditions: [{ field: 'test', operator: 'eq' as const, value: 'test' }],
              logic: 'and' as const,
            },
          },
        ],
        connections: [
          { from: 'trigger', to: 'failing-node' },
          { from: 'failing-node', to: 'success-node' },
        ],
        trigger: {
          id: 'trigger',
          type: NodeType.WEBHOOK,
          name: 'Webhook Trigger',
          config: { path: '/test', method: 'POST' as const },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const execution = await engine.executeWorkflow(workflow, {});

      // Should succeed despite failing node
      expect(execution.status).toBe(ExecutionStatus.SUCCESS);
      
      // Check that success node was executed
      const successNodeLog = execution.logs.find(log => 
        log.message.includes('Success Node')
      );
      expect(successNodeLog).toBeDefined();
    });
  });

  describe('Timeout handling', () => {
    it.skip('should timeout long-running nodes', async () => {
      // TODO: Implement DELAY node type for timeout testing
      const workflow: Workflow = {
        _id: 'workflow:test:timeout',
        type: 'workflow',
        name: 'Timeout Test',
        status: WorkflowStatus.ACTIVE,
        version: 1,
        nodes: [
          {
            id: 'trigger',
            type: NodeType.WEBHOOK,
            name: 'Webhook Trigger',
            config: { path: '/test', method: 'POST' as const },
          },
        ],
        connections: [],
        trigger: {
          id: 'trigger',
          type: NodeType.WEBHOOK,
          name: 'Webhook Trigger',
          config: { path: '/test', method: 'POST' as const },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const execution = await engine.executeWorkflow(workflow, {});
      expect(execution.status).toBe(ExecutionStatus.SUCCESS);
    });
  });
});

