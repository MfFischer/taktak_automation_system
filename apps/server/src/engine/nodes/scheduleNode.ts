/**
 * Schedule node handler
 * Handles cron-based scheduling (trigger node)
 */

import { WorkflowNode, ScheduleNodeConfig } from '@taktak/types';

import { NodeHandler } from '../nodeExecutor';
import { logger } from '../../utils/logger';

export class ScheduleNodeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const config = node.config as unknown as ScheduleNodeConfig;

    logger.info('Schedule node triggered', {
      nodeId: node.id,
      cron: config.cron,
      timezone: config.timezone,
    });

    // Schedule nodes are triggers - they don't produce output during execution
    // The actual scheduling is handled by the scheduler service
    return {
      triggered: true,
      timestamp: new Date().toISOString(),
      cron: config.cron,
    };
  }
}

