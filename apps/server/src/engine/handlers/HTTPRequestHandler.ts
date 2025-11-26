/**
 * HTTP Request Node Handler
 * Makes HTTP requests to external APIs
 */

import { WorkflowNode } from '@taktak/types';
import { NodeHandler } from './types';

export class HTTPRequestHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { url, method, headers, body } = node.config;

    if (!url) {
      throw new Error('URL is required for HTTP request');
    }

    // Resolve variables in URL, headers, and body
    const resolvedUrl = this.resolveValue(url, context) as string;
    const resolvedHeaders = headers ? this.resolveObject(headers as Record<string, unknown>, context) : {};
    const resolvedBody = body ? this.resolveValue(body, context) : undefined;

    const requestOptions: RequestInit = {
      method: (method as string) || 'GET',
      headers: resolvedHeaders as Record<string, string>,
    };

    if (resolvedBody && method !== 'GET' && method !== 'HEAD') {
      requestOptions.body = typeof resolvedBody === 'string' ? resolvedBody : JSON.stringify(resolvedBody);
    }

    const response = await fetch(resolvedUrl, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  private resolveValue(value: unknown, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): unknown {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const key = value.slice(2, -2).trim();
      return context.variables[key] ?? context.input[key] ?? value;
    }
    return value;
  }

  private resolveObject(obj: Record<string, unknown>, context: { input: Record<string, unknown>; variables: Record<string, unknown> }): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = this.resolveValue(value, context);
    }
    return resolved;
  }
}

