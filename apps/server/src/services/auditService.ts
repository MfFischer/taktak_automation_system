/**
 * Audit Service
 * Handles audit logging for security and compliance
 */

import { AuditLog } from '@taktak/types';
import { getLocalDatabase } from '../database/pouchdb.js';
import { logger } from '../utils/logger.js';

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.register'
  | 'user.password_change'
  | 'user.data_export'
  | 'user.account_delete'
  | 'workflow.create'
  | 'workflow.update'
  | 'workflow.delete'
  | 'workflow.execute'
  | 'workflow.activate'
  | 'workflow.deactivate'
  | 'credential.create'
  | 'credential.update'
  | 'credential.delete'
  | 'settings.update'
  | 'api_key.create'
  | 'api_key.revoke';

export type AuditResource = 'user' | 'workflow' | 'credential' | 'settings' | 'api_key' | 'execution';

export interface CreateAuditLogParams {
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  userId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export class AuditService {
  private db = getLocalDatabase();

  /**
   * Create an audit log entry
   */
  async log(params: CreateAuditLogParams): Promise<AuditLog> {
    const auditLog: AuditLog = {
      _id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'audit',
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      userId: params.userId,
      timestamp: new Date().toISOString(),
      details: params.details,
      ipAddress: params.ipAddress,
    };

    try {
      await this.db.put(auditLog);
      logger.debug('Audit log created', { action: params.action, resource: params.resource });
      return auditLog;
    } catch (error) {
      logger.error('Failed to create audit log', { error, params });
      throw error;
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getLogs(options: {
    userId?: string;
    resource?: AuditResource;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const { userId, resource, action, startDate, endDate, limit = 50, skip = 0 } = options;

    const result = await this.db.allDocs({
      include_docs: true,
      startkey: 'audit_',
      endkey: 'audit_\ufff0',
    });

    let logs: AuditLog[] = result.rows
      .map((row) => row.doc as unknown as AuditLog)
      .filter((log: AuditLog) => log && log.type === 'audit');

    // Apply filters
    if (userId) logs = logs.filter((log: AuditLog) => log.userId === userId);
    if (resource) logs = logs.filter((log: AuditLog) => log.resource === resource);
    if (action) logs = logs.filter((log: AuditLog) => log.action === action);
    if (startDate) logs = logs.filter((log: AuditLog) => log.timestamp >= startDate);
    if (endDate) logs = logs.filter((log: AuditLog) => log.timestamp <= endDate);

    // Sort by timestamp descending
    logs.sort((a: AuditLog, b: AuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = logs.length;
    const paginatedLogs = logs.slice(skip, skip + limit);

    return { logs: paginatedLogs, total };
  }

  /**
   * Get audit logs for a specific user (for GDPR data export)
   */
  async getUserAuditLogs(userId: string): Promise<AuditLog[]> {
    const { logs } = await this.getLogs({ userId, limit: 1000 });
    return logs;
  }

  /**
   * Delete audit logs for a user (for GDPR account deletion)
   */
  async deleteUserAuditLogs(userId: string): Promise<number> {
    const { logs } = await this.getLogs({ userId, limit: 10000 });
    
    let deleted = 0;
    for (const log of logs) {
      try {
        await this.db.remove(log._id, log._rev!);
        deleted++;
      } catch (error) {
        logger.error('Failed to delete audit log', { logId: log._id, error });
      }
    }

    return deleted;
  }

  /**
   * Cleanup old audit logs (retention policy)
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffStr = cutoffDate.toISOString();

    const { logs } = await this.getLogs({ endDate: cutoffStr, limit: 10000 });
    
    let deleted = 0;
    for (const log of logs) {
      try {
        await this.db.remove(log._id, log._rev!);
        deleted++;
      } catch (error) {
        logger.error('Failed to delete old audit log', { logId: log._id, error });
      }
    }

    logger.info('Audit log cleanup completed', { deleted, retentionDays });
    return deleted;
  }
}

export const auditService = new AuditService();

