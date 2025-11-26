/**
 * Integration tests for workflow versioning
 */

import { WorkflowService } from './workflowService';
import { NodeType, Workflow } from '@taktak/types';
import { createTestDatabase, destroyTestDatabase } from '../database/pouchdb';

describe('Workflow Versioning Integration Tests', () => {
  let service: WorkflowService;
  let testWorkflowId: string;
  let testDb: PouchDB.Database;

  beforeEach(async () => {
    // Create a unique test database for this test
    testDb = createTestDatabase('versioning_integration');
    service = new WorkflowService(testDb);

    // Create a test workflow
    const workflow = await service.createWorkflow({
      name: 'Test Workflow',
      description: 'Test workflow for versioning',
      nodes: [
        {
          id: 'trigger',
          type: NodeType.WEBHOOK,
          name: 'Webhook Trigger',
          config: {},
        },
      ],
      connections: [],
      trigger: {
        id: 'trigger',
        type: NodeType.WEBHOOK,
        name: 'Webhook Trigger',
        config: {},
      },
      status: 'draft',
      type: 'workflow',
    });

    testWorkflowId = workflow._id;
  });

  afterEach(async () => {
    // Cleanup
    if (testWorkflowId) {
      try {
        await service.deleteWorkflow(testWorkflowId);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    // Destroy the test database
    await destroyTestDatabase(testDb);
  });

  describe('Version Creation', () => {
    it('should create version 1 on workflow creation', async () => {
      const workflow = await service.getWorkflowById(testWorkflowId);

      expect(workflow.version).toBe(1);

      // Check that a version was created
      const versions = await service.listWorkflowVersions(testWorkflowId);
      expect(versions.length).toBeGreaterThan(0);
    });

    it('should increment version on significant changes', async () => {
      // Update workflow with significant changes
      const updated = await service.updateWorkflow(testWorkflowId, {
        nodes: [
          {
            id: 'trigger',
            type: NodeType.WEBHOOK,
            name: 'Webhook Trigger',
            config: {},
          },
          {
            id: 'http',
            type: NodeType.HTTP_REQUEST,
            name: 'API Call',
            config: {
              url: 'https://api.example.com',
              method: 'GET',
            },
          },
        ],
        connections: [
          { from: 'trigger', to: 'http' },
        ],
      });

      expect(updated.version).toBe(2);

      const versions = await service.listWorkflowVersions(testWorkflowId);
      expect(versions.length).toBe(2);
    });

    it('should not create version for minor changes', async () => {
      // Update only the name (minor change)
      const updated = await service.updateWorkflow(testWorkflowId, {
        name: 'Updated Test Workflow',
      });

      expect(updated.version).toBe(1);

      const versions = await service.listWorkflowVersions(testWorkflowId);
      expect(versions.length).toBe(1);
    });
  });

  describe('Version Rollback', () => {
    it('should rollback to previous version', async () => {
      // Create version 2
      await service.updateWorkflow(testWorkflowId, {
        nodes: [
          {
            id: 'trigger',
            type: NodeType.WEBHOOK,
            name: 'Webhook Trigger',
            config: {},
          },
          {
            id: 'http',
            type: NodeType.HTTP_REQUEST,
            name: 'API Call',
            config: {
              url: 'https://api.example.com',
              method: 'GET',
            },
          },
        ],
        connections: [
          { from: 'trigger', to: 'http' },
        ],
      });

      // Create version 3
      await service.updateWorkflow(testWorkflowId, {
        nodes: [
          {
            id: 'trigger',
            type: NodeType.WEBHOOK,
            name: 'Webhook Trigger',
            config: {},
          },
          {
            id: 'http',
            type: NodeType.HTTP_REQUEST,
            name: 'API Call',
            config: {
              url: 'https://api.example.com/v2',
              method: 'POST',
            },
          },
        ],
      });

      const workflow = await service.getWorkflowById(testWorkflowId);
      expect(workflow.version).toBe(3);

      // Rollback to version 2
      const versions = await service.listWorkflowVersions(testWorkflowId);
      const version2 = versions.find(v => v.version === 2);
      if (version2) {
        const rolledBack = await service.rollbackToVersion(testWorkflowId, version2._id);

        // Version stays at 3 (backup created but version doesn't increment on rollback)
        expect(rolledBack.version).toBe(3);
        expect(rolledBack.nodes.length).toBe(2);
        expect((rolledBack.nodes[1].config as any).url).toBe('https://api.example.com');
      }
    });

    it('should preserve version history after rollback', async () => {
      // Create multiple versions
      await service.updateWorkflow(testWorkflowId, {
        description: 'Version 2',
        nodes: [
          {
            id: 'trigger',
            type: NodeType.WEBHOOK,
            name: 'Webhook Trigger',
            config: {},
          },
        ],
      });

      await service.updateWorkflow(testWorkflowId, {
        description: 'Version 3',
      });

      const workflow = await service.getWorkflowById(testWorkflowId);
      const versions = await service.listWorkflowVersions(testWorkflowId);
      const originalVersionCount = versions.length;

      // Rollback
      const version2 = versions.find(v => v.version === 2);
      if (version2) {
        const rolledBack = await service.rollbackToVersion(testWorkflowId, version2._id);

        // Version history should be preserved and extended
        const newVersions = await service.listWorkflowVersions(testWorkflowId);
        expect(newVersions.length).toBeGreaterThanOrEqual(originalVersionCount);
      }
    });
  });

  describe('Version Pruning', () => {
    it('should keep only N most recent versions', async () => {
      // Create 10 versions
      for (let i = 0; i < 10; i++) {
        await service.updateWorkflow(testWorkflowId, {
          description: `Version ${i + 2}`,
          nodes: [
            {
              id: 'trigger',
              type: NodeType.WEBHOOK,
              name: `Webhook Trigger ${i}`,
              config: {},
            },
          ],
        });
      }

      const versions = await service.listWorkflowVersions(testWorkflowId);
      expect(versions.length).toBeGreaterThan(5);

      // Prune to keep only 5 versions
      await service.pruneWorkflowVersions(testWorkflowId, 5);

      const prunedVersions = await service.listWorkflowVersions(testWorkflowId);
      expect(prunedVersions.length).toBeLessThanOrEqual(5);
    });
  });
});

