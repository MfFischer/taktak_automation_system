/**
 * Tests for WorkflowService
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WorkflowService } from './workflowService';
import { WorkflowStatus, NodeType } from '@taktak/types';

// Mock dependencies
jest.mock('../database/pouchdb');
jest.mock('./executionService');
jest.mock('../engine/workflowEngine');

describe('WorkflowService', () => {
  let service: WorkflowService;

  beforeEach(() => {
    service = new WorkflowService();
  });

  describe('validateWorkflowStructure', () => {
    it('should validate a valid workflow', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'Test description',
        status: WorkflowStatus.DRAFT,
        nodes: [
          {
            id: 'node-1',
            name: 'Schedule',
            type: NodeType.SCHEDULE,
            position: { x: 0, y: 0 },
            config: { cron: '0 9 * * *' },
          },
          {
            id: 'node-2',
            name: 'Send SMS',
            type: NodeType.SEND_SMS,
            position: { x: 0, y: 100 },
            config: { to: '+1234567890', message: 'Test' },
          },
        ],
        connections: [
          {
            from: 'node-1',
            to: 'node-2',
          },
        ],
        trigger: {
          id: 'node-1',
          type: NodeType.SCHEDULE,
          name: 'Schedule Trigger',
          config: { cron: '0 0 * * *' },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Should not throw
      expect(() => {
        // @ts-expect-error - accessing private method for testing
        service.validateWorkflowStructure(workflow);
      }).not.toThrow();
    });

    it('should reject workflow without nodes', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'Test description',
        status: WorkflowStatus.DRAFT,
        nodes: [],
        connections: [],
        trigger: {
          type: 'schedule',
          nodeId: 'node-1',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => {
        // @ts-expect-error - accessing private method for testing
        service.validateWorkflowStructure(workflow);
      }).toThrow('Workflow must have at least one node');
    });

    it('should reject workflow without trigger', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'Test description',
        status: WorkflowStatus.DRAFT,
        nodes: [
          {
            id: 'node-1',
            name: 'Send SMS',
            type: NodeType.SEND_SMS,
            position: { x: 0, y: 0 },
            config: { to: '+1234567890', message: 'Test' },
          },
        ],
        connections: [],
        trigger: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => {
        // @ts-expect-error - accessing private method for testing
        service.validateWorkflowStructure(workflow);
      }).toThrow('Workflow must have a trigger');
    });

    it('should reject workflow with invalid trigger node', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'Test description',
        status: WorkflowStatus.DRAFT,
        nodes: [
          {
            id: 'node-1',
            name: 'Send SMS',
            type: NodeType.SEND_SMS,
            position: { x: 0, y: 0 },
            config: { to: '+1234567890', message: 'Test' },
          },
        ],
        connections: [],
        trigger: {
          id: 'non-existent-node',
          type: NodeType.SCHEDULE,
          name: 'Schedule Trigger',
          config: { cron: '0 0 * * *' },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => {
        // @ts-expect-error - accessing private method for testing
        service.validateWorkflowStructure(workflow);
      }).toThrow('Trigger node must exist in workflow nodes');
    });

    it('should reject workflow with invalid connections', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'Test description',
        status: WorkflowStatus.DRAFT,
        nodes: [
          {
            id: 'node-1',
            name: 'Schedule',
            type: NodeType.SCHEDULE,
            position: { x: 0, y: 0 },
            config: { cron: '0 9 * * *' },
          },
        ],
        connections: [
          {
            from: 'node-1',
            to: 'non-existent-node',
          },
        ],
        trigger: {
          id: 'node-1',
          type: NodeType.SCHEDULE,
          name: 'Schedule Trigger',
          config: { cron: '0 9 * * *' },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => {
        // @ts-expect-error - accessing private method for testing
        service.validateWorkflowStructure(workflow);
      }).toThrow('Connection references non-existent node');
    });
  });
});

