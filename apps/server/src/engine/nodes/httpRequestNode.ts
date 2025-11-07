/**
 * HTTP Request node handler
 * Makes HTTP requests to external APIs
 */

import axios, { AxiosRequestConfig, Method } from 'axios';

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { logger } from '../../utils/logger';
import { ExternalServiceError } from '../../utils/errors';

interface HttpRequestConfig {
  url: string;
  method: Method;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  timeout?: number;
}

export class HttpRequestNodeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const config = node.config as unknown as HttpRequestConfig;

    // Replace variables in URL
    const url = this.replaceVariables(config.url, context);

    logger.info('Making HTTP request', {
      nodeId: node.id,
      method: config.method,
      url,
    });

    try {
      const requestConfig: AxiosRequestConfig = {
        method: config.method,
        url,
        headers: config.headers,
        params: config.params,
        timeout: config.timeout || 30000,
      };

      // Add body for POST, PUT, PATCH
      if (['POST', 'PUT', 'PATCH'].includes(config.method) && config.body) {
        requestConfig.data = this.replaceVariablesInObject(config.body, context);
      }

      const response = await axios(requestConfig);

      logger.info('HTTP request completed', {
        nodeId: node.id,
        status: response.status,
        dataSize: JSON.stringify(response.data).length,
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      };
    } catch (error) {
      logger.error('HTTP request failed', {
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (axios.isAxiosError(error)) {
        throw new ExternalServiceError(
          'HTTP Request',
          `${error.response?.status || 'Network'} - ${error.message}`
        );
      }

      throw error;
    }
  }

  /**
   * Replaces template variables in string
   */
  private replaceVariables(
    template: string,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(context.variables[key] || context.input[key] || '');
    });
  }

  /**
   * Replaces template variables in object recursively
   */
  private replaceVariablesInObject(
    obj: unknown,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): unknown {
    if (typeof obj === 'string') {
      return this.replaceVariables(obj, context);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.replaceVariablesInObject(item, context));
    }

    if (obj && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.replaceVariablesInObject(value, context);
      }
      return result;
    }

    return obj;
  }
}

