/**
 * Tests for workflow versioning functionality
 */

import { WorkflowService } from './workflowService';
import { WorkflowStatus, NodeType } from '@taktak/types';
import { createTestDatabase, destroyTestDatabase } from '../database/pouchdb';

describe('WorkflowService - Versioning', () => {
  let workflowService: WorkflowService;
  let db: PouchDB.Database;

  beforeEach(() => {
    // Create a unique test database for each test
    db = createTestDatabase('versioning');
    workflowService = new WorkflowService(db);
  });

  afterEach(async () => {
    // Destroy the test database
    await destroyTestDatabase(db);
  });

  describe('createWorkflow', () => {
    it('should create workflow with initial version', async () => {
      const workflowData = {
        type: 'workflow' as const,
        name: 'Test Workflow',
        description: 'Test workflow for versioning',
        status: WorkflowStatus.DRAFT,
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
      };

      const workflow = await workflowService.createWorkflow(workflowData);

      expect(workflow.version).toBe(1);
      expect(workflow._id).toBeDefined();
      expect(workflow.name).toBe('Test Workflow');

      // Check that initial version was created
      const versions = await workflowService.listWorkflowVersions(workflow._id);
      expect(versions.length).toBe(1);
      expect(versions[0].version).toBe(1);
      expect(versions[0].changeDescription).toBe('Initial version');
    });
  });

  describe('updateWorkflow', () => {
    it('should increment version on significant changes', async () => {
      // Create initial workflow
      const workflowData = {
        type: 'workflow' as const,
        name: 'Test Workflow',
        status: WorkflowStatus.DRAFT,
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
      };

      const workflow = await workflowService.createWorkflow(workflowData);
      expect(workflow.version).toBe(1);

      // Update with new node (significant change)
      const updated = await workflowService.updateWorkflow(workflow._id, {
        nodes: [
          ...workflow.nodes,
          {
            id: 'email',
            type: NodeType.SEND_EMAIL,
            name: 'Send Email',
            config: { to: 'test@example.com', subject: 'Test', body: 'Test' },
          },
        ],
      });

      expect(updated.version).toBe(2);

      // Check versions
      const versions = await workflowService.listWorkflowVersions(workflow._id);
      expect(versions.length).toBe(2);
    });

    it('should not increment version for minor changes', async () => {
      const workflowData = {
        type: 'workflow' as const,
        name: 'Test Workflow',
        status: WorkflowStatus.DRAFT,
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
      };

      const workflow = await workflowService.createWorkflow(workflowData);

      // Update description only (minor change)
      const updated = await workflowService.updateWorkflow(workflow._id, {
        description: 'Updated description',
      });

      expect(updated.version).toBe(1); // Version should not change
    });
  });
});

