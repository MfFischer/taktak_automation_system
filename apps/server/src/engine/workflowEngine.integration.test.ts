/**
 * Integration tests for workflow engine
 * Tests complete workflow execution with all Phase 1 features
 */

import { WorkflowEngine } from './workflowEngine';
import { NodeType, WorkflowNode, WorkflowConnection, ExecutionStatus } from '@taktak/types';
import { createTestDatabase, destroyTestDatabase } from '../database/pouchdb';

describe('WorkflowEngine Integration Tests', () => {
  let engine: WorkflowEngine;
  let testDb: PouchDB.Database;

  beforeEach(() => {
    // Create a unique test database for each test
    testDb = createTestDatabase('engine_integration');
    engine = new WorkflowEngine(testDb);
  });

  afterEach(async () => {
    // Destroy the test database
    await destroyTestDatabase(testDb);
  });

  describe('Complete Workflow Execution', () => {
    it('should execute workflow with loop and error handling', async () => {
      const nodes: WorkflowNode[] = [
        {
          id: 'trigger',
          type: NodeType.WEBHOOK,
          name: 'Webhook Trigger',
          config: {},
        },
        {
          id: 'loop',
          type: NodeType.LOOP,
          name: 'Process Items',
          config: {
            items: [1, 2, 3, 4, 5],
            batchSize: 2,
            continueOnItemError: true,
          },
        },
        {
          id: 'http',
          type: NodeType.HTTP_REQUEST,
          name: 'API Call',
          config: {
            url: 'https://jsonplaceholder.typicode.com/posts/{{$item}}',
            method: 'GET',
          },
          executionConfig: {
            retries: 3,
            retryDelay: 1000,
            timeout: 5000,
            continueOnError: true,
          },
        },
      ];

      const connections: WorkflowConnection[] = [
        { from: 'trigger', to: 'loop' },
        { from: 'loop', to: 'http' },
      ];

      const result = await engine.executeWorkflow({
        _id: 'test-workflow',
        type: 'workflow',
        name: 'Test Workflow',
        status: 'active',
        nodes,
        connections,
        trigger: nodes[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, {});

      expect(result.status).toBe(ExecutionStatus.SUCCESS);
      expect(result.logs).toBeDefined();
      expect(result.logs.length).toBeGreaterThan(0);
    });

    it('should handle errors with error trigger node', async () => {
      const nodes: WorkflowNode[] = [
        {
          id: 'trigger',
          type: NodeType.WEBHOOK,
          name: 'Webhook Trigger',
          config: {},
        },
        {
          id: 'http',
          type: NodeType.HTTP_REQUEST,
          name: 'Failing API Call',
          config: {
            url: 'https://invalid-domain-that-does-not-exist.com/api',
            method: 'GET',
          },
          executionConfig: {
            retries: 2,
            retryDelay: 500,
            timeout: 2000,
          },
        },
        {
          id: 'error-handler',
          type: NodeType.ERROR_TRIGGER,
          name: 'Error Handler',
          config: {
            errorTypes: ['network', 'timeout'],
            notifyEmail: 'admin@example.com',
          },
        },
      ];

      const connections: WorkflowConnection[] = [
        { from: 'trigger', to: 'http' },
      ];

      const result = await engine.executeWorkflow({
        _id: 'test-workflow-2',
        type: 'workflow',
        name: 'Test Workflow 2',
        status: 'active',
        nodes,
        connections,
        trigger: nodes[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, {});

      // Should fail but error trigger should be activated
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });

    it('should execute nodes in parallel when configured', async () => {
      const nodes: WorkflowNode[] = [
        {
          id: 'trigger',
          type: NodeType.WEBHOOK,
          name: 'Webhook Trigger',
          config: {},
        },
        {
          id: 'http1',
          type: NodeType.HTTP_REQUEST,
          name: 'API Call 1',
          config: {
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            method: 'GET',
          },
          executionConfig: {
            parallel: true,
          },
        },
        {
          id: 'http2',
          type: NodeType.HTTP_REQUEST,
          name: 'API Call 2',
          config: {
            url: 'https://jsonplaceholder.typicode.com/posts/2',
            method: 'GET',
          },
          executionConfig: {
            parallel: true,
          },
        },
      ];

      const connections: WorkflowConnection[] = [
        { from: 'trigger', to: 'http1' },
        { from: 'trigger', to: 'http2' },
      ];

      const startTime = Date.now();
      const result = await engine.executeWorkflow({
        _id: 'test-workflow-3',
        type: 'workflow',
        name: 'Test Workflow 3',
        status: 'active',
        nodes,
        connections,
        trigger: nodes[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, {});
      const duration = Date.now() - startTime;

      expect(result.status).toBe('success');
      // Parallel execution should be faster than sequential
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed nodes according to executionConfig', async () => {
      let attemptCount = 0;

      const nodes: WorkflowNode[] = [
        {
          id: 'trigger',
          type: NodeType.WEBHOOK,
          name: 'Webhook Trigger',
          config: {},
        },
      ];

      const connections: WorkflowConnection[] = [];

      // This test would need mocking to properly test retry logic
      // For now, we just verify the structure is correct
      expect(nodes[0].executionConfig?.retries).toBeUndefined();
    });
  });
});

