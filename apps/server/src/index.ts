/**
 * Server entry point
 */

import { config, validateConfig } from './config/environment';
import { logger } from './utils/logger';
import { setupProcessErrorHandlers } from './middleware/errorHandler';
import { initializeLocalDatabase, initializeRemoteDatabase, startSync, closeDatabases } from './database/pouchdb';
import { createApp } from './app';

/**
 * Starts the server
 */
async function startServer(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();
    logger.info('Configuration validated');

    // Setup process error handlers
    setupProcessErrorHandlers();
    logger.info('Process error handlers setup');

    // Initialize databases
    logger.info('Initializing databases...');
    initializeLocalDatabase();

    if (config.features.cloudSync) {
      initializeRemoteDatabase();
      startSync();
      logger.info('Cloud sync enabled and started');
    } else {
      logger.info('Cloud sync disabled');
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`Server started`, {
        environment: config.nodeEnv,
        host: config.server.host,
        port: config.server.port,
        url: config.server.apiBaseUrl,
      });

      logger.info('Taktak server is ready to accept requests');
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await closeDatabases();
          logger.info('Databases closed');

          logger.info('Shutdown complete');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Start the server
startServer();

