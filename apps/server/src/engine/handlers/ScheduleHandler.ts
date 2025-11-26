/**
 * Schedule Trigger Handler
 * Triggers workflows on a schedule (cron-like)
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';

export class ScheduleHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { schedule, timezone } = node.config;

    if (!schedule) {
      throw new Error('Schedule is required for schedule trigger');
    }

    // Return schedule information
    // In a real implementation, this would set up a cron job
    return {
      triggered: true,
      schedule,
      timezone: timezone || 'UTC',
      timestamp: new Date().toISOString(),
      message: 'Schedule trigger executed',
    };
  }
}

