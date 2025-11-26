/**
 * Tests for Loop node handler
 */

import { LoopNodeHandler } from './loopNode';
import { NodeType } from '@taktak/types';

describe('LoopNodeHandler', () => {
  let handler: LoopNodeHandler;

  beforeEach(() => {
    handler = new LoopNodeHandler();
  });

  describe('execute', () => {
    it('should iterate over array items', async () => {
      const node = {
        id: 'loop1',
        type: NodeType.LOOP,
        name: 'Loop Node',
        config: {
          items: ['item1', 'item2', 'item3'],
        },
      };

      const context = {
        input: {},
        variables: {},
      };

      const result = await handler.execute(node, context) as any;

      expect(result.count).toBe(3);
      expect(result.successCount).toBe(3);
      expect(result.errorCount).toBe(0);
      expect(result.items).toHaveLength(3);
    });

    it('should resolve items from expression', async () => {
      const node = {
        id: 'loop1',
        type: NodeType.LOOP,
        name: 'Loop Node',
        config: {
          items: '{{$json.data}}',
        },
      };

      const context = {
        input: {
          data: [1, 2, 3, 4, 5],
        },
        variables: {},
      };

      const result = await handler.execute(node, context) as any;

      expect(result.count).toBe(5);
      expect(result.successCount).toBe(5);
    });

    it('should handle empty array', async () => {
      const node = {
        id: 'loop1',
        type: NodeType.LOOP,
        name: 'Loop Node',
        config: {
          items: [],
        },
      };

      const context = {
        input: {},
        variables: {},
      };

      const result = await handler.execute(node, context) as any;

      expect(result.count).toBe(0);
      expect(result.items).toEqual([]);
    });

    it('should respect maxIterations limit', async () => {
      const node = {
        id: 'loop1',
        type: NodeType.LOOP,
        name: 'Loop Node',
        config: {
          items: new Array(2000).fill('item'),
          maxIterations: 100,
        },
      };

      const context = {
        input: {},
        variables: {},
      };

      await expect(handler.execute(node, context)).rejects.toThrow(
        'Loop exceeds maximum iterations limit'
      );
    });

    it('should throw error for non-array items', async () => {
      const node = {
        id: 'loop1',
        type: NodeType.LOOP,
        name: 'Loop Node',
        config: {
          items: 'not an array',
        },
      };

      const context = {
        input: {},
        variables: {},
      };

      await expect(handler.execute(node, context)).rejects.toThrow('Cannot resolve expression: not an array');
    });

    it('should resolve items from previous node output', async () => {
      const node = {
        id: 'loop1',
        type: NodeType.LOOP,
        name: 'Loop Node',
        config: {
          items: '{{$node.previousNode}}',
        },
      };

      const context = {
        input: {},
        variables: {
          previousNode: ['a', 'b', 'c'],
        },
      };

      const result = await handler.execute(node, context) as any;

      expect(result.count).toBe(3);
      expect(result.successCount).toBe(3);
    });

    it('should process items in batches', async () => {
      const node = {
        id: 'loop1',
        type: NodeType.LOOP,
        name: 'Loop Node',
        config: {
          items: [1, 2, 3, 4, 5, 6],
          batchSize: 2,
        },
      };

      const context = {
        input: {},
        variables: {},
      };

      const result = await handler.execute(node, context) as any;

      expect(result.count).toBe(6);
      expect(result.successCount).toBe(6);
    });
  });
});

