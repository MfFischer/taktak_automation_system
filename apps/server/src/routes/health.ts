/**
 * Health check routes
 */

import { Router, Request, Response } from 'express';

import { asyncHandler } from '../middleware/errorHandler';
import { getLocalDatabase, checkRemoteConnection, getDatabaseInfo } from '../database/pouchdb';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Basic health check
 * GET /health
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    });
  })
);

/**
 * Detailed health check with dependencies
 * GET /health/detailed
 */
router.get(
  '/detailed',
  asyncHandler(async (_req: Request, res: Response) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      services: {
        database: {
          local: false,
          remote: false,
        },
        features: {
          cloudSync: config.features.cloudSync,
          aiFeatures: config.features.aiFeatures,
          analytics: config.features.analytics,
        },
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    };

    // Check local database
    try {
      const localDb = getLocalDatabase();
      const localInfo = await getDatabaseInfo(localDb);
      health.services.database.local = true;
      logger.debug('Local database healthy', { docCount: localInfo.doc_count });
    } catch (error) {
      logger.error('Local database unhealthy', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      health.status = 'degraded';
    }

    // Check remote database if enabled
    if (config.features.cloudSync) {
      try {
        const remoteHealthy = await checkRemoteConnection();
        health.services.database.remote = remoteHealthy;
        if (!remoteHealthy) {
          health.status = 'degraded';
        }
      } catch (error) {
        logger.error('Remote database unhealthy', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        health.status = 'degraded';
      }
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  })
);

/**
 * Readiness check (for Kubernetes)
 * GET /health/ready
 */
router.get(
  '/ready',
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      const localDb = getLocalDatabase();
      await getDatabaseInfo(localDb);

      res.json({
        ready: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        ready: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

/**
 * Liveness check (for Kubernetes)
 * GET /health/live
 */
router.get('/live', (_req: Request, res: Response) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

export default router;

