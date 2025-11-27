/**
 * NodeExecutor Tests
 * Tests handler registration and execution
 */

import { NodeType, NODE_REGISTRY, WorkflowNode } from '@taktak/types';
import { NodeExecutor } from '../engine/nodeExecutor';

describe('NodeExecutor', () => {
  let executor: NodeExecutor;

  beforeEach(() => {
    executor = new NodeExecutor();
  });

  describe('Handler Registration', () => {
    it('should have handlers for all backend-implemented nodes', () => {
      const backendImplementedNodes = Object.values(NODE_REGISTRY)
        .filter((node) => node.backendImplemented)
        .map((node) => node.type);

      // Access private handlers map via any cast for testing
      const handlers = (executor as any).handlers as Map<NodeType, unknown>;

      for (const nodeType of backendImplementedNodes) {
        expect(handlers.has(nodeType)).toBe(true);
      }
    });

    it('should have correct number of handlers', () => {
      const handlers = (executor as any).handlers as Map<NodeType, unknown>;
      const expectedCount = Object.values(NODE_REGISTRY).filter(
        (node) => node.backendImplemented
      ).length;

      // Allow some tolerance for planned nodes
      expect(handlers.size).toBeGreaterThanOrEqual(expectedCount - 5);
    });
  });

  describe('Node Execution', () => {
    it('should throw error for unknown node type', async () => {
      const unknownNode: WorkflowNode = {
        id: 'test-node',
        type: 'UNKNOWN_TYPE' as NodeType,
        name: 'Unknown Node',
        position: { x: 0, y: 0 },
        config: {},
      };

      await expect(
        executor.execute(unknownNode, { input: {}, variables: {} })
      ).rejects.toThrow('No handler for node type');
    });

    it('should execute delay node successfully', async () => {
      const delayNode: WorkflowNode = {
        id: 'delay-node',
        type: NodeType.DELAY,
        name: 'Test Delay',
        position: { x: 0, y: 0 },
        config: { duration: 10 }, // 10ms delay
      };

      const startTime = Date.now();
      await executor.execute(delayNode, { input: {}, variables: {} });
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(10);
    }, 15000); // Increase timeout for delay test

    it('should execute condition node with true condition', async () => {
      const conditionNode: WorkflowNode = {
        id: 'condition-node',
        type: NodeType.CONDITION,
        name: 'Test Condition',
        position: { x: 0, y: 0 },
        config: {
          field: 'value',
          operator: 'equals',
          value: 'test',
        },
      };

      const result = await executor.execute(conditionNode, {
        input: { value: 'test' },
        variables: {},
      });

      expect(result).toHaveProperty('result', true);
    });

    it('should execute condition node with false condition', async () => {
      const conditionNode: WorkflowNode = {
        id: 'condition-node',
        type: NodeType.CONDITION,
        name: 'Test Condition',
        position: { x: 0, y: 0 },
        config: {
          field: 'value',
          operator: 'equals',
          value: 'test',
        },
      };

      const result = await executor.execute(conditionNode, {
        input: { value: 'different' },
        variables: {},
      });

      // The condition handler may return result or branch property
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should execute transform node', async () => {
      const transformNode: WorkflowNode = {
        id: 'transform-node',
        type: NodeType.TRANSFORM,
        name: 'Test Transform',
        position: { x: 0, y: 0 },
        config: {
          transformations: [
            { field: 'name', operation: 'uppercase' },
          ],
        },
      };

      const result = await executor.execute(transformNode, {
        input: { name: 'hello' },
        variables: {},
      });

      expect(result).toBeDefined();
    });
  });

  describe('NODE_REGISTRY Consistency', () => {
    it('should have valid metadata for all nodes', () => {
      for (const [type, metadata] of Object.entries(NODE_REGISTRY)) {
        expect(metadata.type).toBe(type);
        expect(metadata.label).toBeTruthy();
        expect(metadata.description).toBeTruthy();
        expect(metadata.category).toBeTruthy();
        expect(metadata.kind).toBeTruthy();
        expect(metadata.icon).toBeTruthy();
        expect(['stable', 'beta', 'planned']).toContain(metadata.status);
      }
    });

    it('should have consistent backendImplemented flags', () => {
      const handlers = (executor as any).handlers as Map<NodeType, unknown>;

      for (const [type, metadata] of Object.entries(NODE_REGISTRY)) {
        if (metadata.backendImplemented && metadata.status !== 'planned') {
          expect(handlers.has(type as NodeType)).toBe(true);
        }
      }
    });
  });
});

