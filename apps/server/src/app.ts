/**
 * Express application setup
 */

import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';

import { config } from './config/environment';
import { logger } from './utils/logger';
import {
  helmetMiddleware,
  rateLimiter,
  sanitizeRequest,
  corsPreflightHandler,
} from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import workflowRoutes from './routes/workflows';
import executionRoutes from './routes/executions';
import settingsRoutes from './routes/settings';
import aiRoutes from './routes/ai';
import templateRoutes from './routes/templates';
import licenseRoutes from './routes/license';
import lemonsqueezyRoutes from './routes/lemonsqueezy';
import oauth2Routes from './routes/oauth2';
import gdprRoutes from './routes/gdpr';

/**
 * Creates and configures Express application
 */
export function createApp(): Application {
  const app = express();

  // Trust proxy (for rate limiting behind reverse proxy)
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmetMiddleware);
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    })
  );
  app.use(corsPreflightHandler);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Request sanitization
  app.use(sanitizeRequest);

  // Rate limiting (apply to all routes except health check)
  app.use((req, res, next) => {
    if (req.path === '/health' || req.path === '/') {
      return next();
    }
    return rateLimiter(req, res, next);
  });

  // Request logging
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Routes
  app.use('/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/workflows', workflowRoutes);
  app.use('/api/executions', executionRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/license', licenseRoutes);
  app.use('/api/lemonsqueezy', lemonsqueezyRoutes);
  app.use('/api/oauth2', oauth2Routes);
  app.use('/api/gdpr', gdprRoutes);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'Taktak API',
      version: '1.0.0',
      status: 'running',
      documentation: '/api/docs',
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp;

