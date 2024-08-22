/**
 * Winston logger configuration
 * Provides structured logging with file rotation
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

import { config } from '../config/environment';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create transports
const transports: winston.transport[] = [];

// Console transport
if (config.isDevelopment || config.isTest) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: config.logging.level,
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: config.logging.level,
    })
  );
}

// File transport with rotation
if (!config.isTest) {
  const logDir = path.dirname(config.logging.filePath);
  const logFilename = path.basename(config.logging.filePath, '.log');

  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: `${logFilename}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: `${config.retention.logDays}d`,
      format: logFormat,
      level: config.logging.level,
    })
  );

  // Separate error log
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: `${logFilename}-error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: `${config.retention.logDays}d`,
      format: logFormat,
      level: 'error',
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

/**
 * Stream for Morgan HTTP logging
 */
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

/**
 * Log workflow execution
 */
export function logWorkflowExecution(
  workflowId: string,
  executionId: string,
  status: string,
  meta?: Record<string, unknown>
): void {
  logger.info('Workflow execution', {
    workflowId,
    executionId,
    status,
    ...meta,
  });
}

/**
 * Log node execution
 */
export function logNodeExecution(
  workflowId: string,
  executionId: string,
  nodeId: string,
  nodeType: string,
  status: string,
  meta?: Record<string, unknown>
): void {
  logger.info('Node execution', {
    workflowId,
    executionId,
    nodeId,
    nodeType,
    status,
    ...meta,
  });
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  userId?: string,
  meta?: Record<string, unknown>
): void {
  logger.warn('Security event', {
    event,
    userId,
    ...meta,
  });
}

/**
 * Log API request
 */
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string
): void {
  logger.info('API request', {
    method,
    path,
    statusCode,
    duration,
    userId,
  });
}

export default logger;

