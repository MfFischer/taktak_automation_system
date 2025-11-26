/**
 * AI service for natural language workflow generation
 * Uses Google Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

import { Workflow, NodeType } from '@taktak/types';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { ValidationError, ExternalServiceError } from '../utils/errors';
import { SettingsService } from './settingsService';
import { openRouterService } from './openRouterService';

// Lazy import for localLLMService to avoid top-level await issues with tsx
let localLLMService: any = null;
let localLLMLoadFailed = false;

async function getLocalLLMService() {
  if (localLLMLoadFailed) {
    throw new Error('Local LLM module failed to load previously');
  }

  if (!localLLMService) {
    try {
      const module = await import('./localLLMService.js');
      localLLMService = module.localLLMService;
    } catch (error) {
      localLLMLoadFailed = true;
      logger.warn('Failed to load local LLM module - skipping local AI tier', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Local LLM module not available');
    }
  }
  return localLLMService;
}

type AIMode = 'cloud' | 'local' | 'auto';
type AIProvider = 'gemini' | 'openrouter' | 'phi3' | 'queued';

import { WorkflowService } from './workflowService';

interface QueuedRequest {
  id: string;
  prompt: string;
  timestamp: number;
  retries: number;
}

export class AIService {
  private settingsService = new SettingsService();
  private workflowService = new WorkflowService();
  private aiMode: AIMode;
  private requestQueue: QueuedRequest[] = [];
  private requestCache: Map<string, { result: any; timestamp: number }> = new Map();
  private readonly CACHE_SIZE = 50;
  private readonly CACHE_TTL = 3600000; // 1 hour
  private lastUsedProvider: AIProvider = 'gemini';

  constructor() {
    this.aiMode = (process.env.AI_MODE as AIMode) || 'auto';
  }

  /**
   * Get current AI mode
   */
  getAIMode(): AIMode {
    return this.aiMode;
  }

  /**
   * Set AI mode
   */
  setAIMode(mode: AIMode): void {
    this.aiMode = mode;
    logger.info('AI mode changed', { mode });
  }

  /**
   * Get last used AI provider
   */
  getLastUsedProvider(): AIProvider {
    return this.lastUsedProvider;
  }

  /**
   * Get queued requests count
   */
  getQueuedRequestsCount(): number {
    return this.requestQueue.length;
  }

  /**
   * Interprets natural language prompt into workflow
   * 4-tier fallback: Gemini → OpenRouter → Phi-3 → Queue
   */
  async interpretPrompt(
    prompt: string,
    userApiKey?: string,
    dryRun: boolean = false
  ): Promise<{ workflow: Partial<Workflow>; confidence: number; suggestions?: string[]; source: AIProvider }> {
    // Check cache first
    const cached = this.checkCache(prompt);
    if (cached) {
      logger.info('Returning cached result');
      return cached;
    }

    const providers: Array<{
      name: AIProvider;
      fn: () => Promise<{ workflow: Partial<Workflow>; confidence: number; suggestions?: string[]; source: AIProvider }>;
      timeout: number;
    }> = [];

    // Build provider chain based on mode
    if (this.aiMode === 'cloud' || this.aiMode === 'auto') {
      // Tier 1: Gemini (fastest, best quality)
      providers.push({
        name: 'gemini',
        fn: () => this.interpretWithGemini(prompt, userApiKey, dryRun),
        timeout: 8000, // 8 seconds
      });

      // Tier 2: OpenRouter (fallback, multiple models)
      if (openRouterService.isConfigured()) {
        providers.push({
          name: 'openrouter',
          fn: () => this.interpretWithOpenRouter(prompt, dryRun),
          timeout: 12000, // 12 seconds
        });
      }
    }

    // Tier 3: Local Phi-3 (offline, slower - first load can take 60-120s)
    if (this.aiMode === 'local' || this.aiMode === 'auto') {
      providers.push({
        name: 'phi3',
        fn: () => this.interpretWithLocal(prompt, dryRun),
        timeout: 180000, // 3 minutes (first load can take 60-120s)
      });
    }

    // Try each provider in sequence
    for (const provider of providers) {
      try {
        logger.info(`Trying AI provider: ${provider.name}`);

        const result = await Promise.race([
          provider.fn(),
          this.createTimeout(provider.timeout, provider.name),
        ]);

        // Success! Cache and return
        this.lastUsedProvider = provider.name;
        this.cacheResult(prompt, result);

        logger.info(`AI provider succeeded: ${provider.name}`, {
          confidence: result.confidence,
        });

        return result;
      } catch (error) {
        logger.warn(`AI provider ${provider.name} failed`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Continue to next provider
        continue;
      }
    }

    // Tier 4: All providers failed - queue for later
    logger.error('All AI providers failed, queueing request');
    this.queueRequest(prompt);
    this.lastUsedProvider = 'queued';

    throw new ExternalServiceError(
      'AI',
      'All AI providers are currently unavailable. Your request has been queued and will be processed when a provider becomes available.'
    );
  }

  /**
   * Interpret prompt using Gemini AI
   */
  private async interpretWithGemini(
    prompt: string,
    userApiKey?: string,
    dryRun: boolean = false
  ): Promise<{ workflow: Partial<Workflow>; confidence: number; suggestions?: string[]; source: 'gemini' }> {
    const apiKey = userApiKey || config.services.gemini.apiKey || (await this.settingsService.getApiKey('gemini'));

    if (!apiKey) {
      throw new ValidationError('Gemini API key not configured. Please add it in settings.');
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const systemPrompt = this.buildSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}\n\nGenerate a workflow JSON:`;

      logger.info('Calling Gemini API', { promptLength: prompt.length });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      const workflow = this.parseWorkflowFromResponse(text);

      // Validate workflow structure
      if (!dryRun) {
        this.validateGeneratedWorkflow(workflow);
      }

      logger.info('Workflow generated from prompt (Gemini)', {
        nodeCount: workflow.nodes?.length || 0,
      });

      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(workflow, prompt);

      return {
        workflow,
        confidence,
        suggestions: this.generateSuggestions(workflow),
        source: 'gemini',
      };
    } catch (error) {
      logger.error('Failed to interpret prompt with cloud AI', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ExternalServiceError('Gemini', error instanceof Error ? error.message : undefined);
    }
  }

  /**
   * Interpret prompt using OpenRouter AI
   */
  private async interpretWithOpenRouter(
    prompt: string,
    dryRun: boolean = false
  ): Promise<{ workflow: Partial<Workflow>; confidence: number; suggestions?: string[]; source: 'openrouter' }> {
    try {
      logger.info('Using OpenRouter AI', { promptLength: prompt.length });

      // Generate workflow JSON using OpenRouter
      const text = await openRouterService.generateWorkflow(prompt);

      // Parse JSON from response
      const workflow = this.parseWorkflowFromResponse(text);

      // Validate workflow structure
      if (!dryRun) {
        this.validateGeneratedWorkflow(workflow);
      }

      logger.info('Workflow generated from prompt (OpenRouter)', {
        nodeCount: workflow.nodes?.length || 0,
      });

      // Calculate confidence score (slightly lower than Gemini)
      const confidence = this.calculateConfidenceScore(workflow, prompt) * 0.98;

      return {
        workflow,
        confidence,
        suggestions: this.generateSuggestions(workflow),
        source: 'openrouter',
      };
    } catch (error) {
      logger.error('Failed to interpret prompt with OpenRouter', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new ExternalServiceError('OpenRouter', error instanceof Error ? error.message : undefined);
    }
  }

  /**
   * Interpret prompt using local AI (Phi-3)
   */
  private async interpretWithLocal(
    prompt: string,
    dryRun: boolean = false
  ): Promise<{ workflow: Partial<Workflow>; confidence: number; suggestions?: string[]; source: 'phi3' }> {
    try {
      logger.info('Using local AI', { promptLength: prompt.length });

      // Get local LLM service (lazy loaded)
      const llmService = await getLocalLLMService();

      // Initialize local LLM if not already done
      if (!llmService.isAvailable()) {
        await llmService.initialize();
      }

      // Generate workflow JSON using local LLM
      const text = await llmService.interpretPrompt(prompt);

      // Parse JSON from response
      const workflow = this.parseWorkflowFromResponse(text);

      // Validate workflow structure
      if (!dryRun) {
        this.validateGeneratedWorkflow(workflow);
      }

      logger.info('Workflow generated from prompt (local)', {
        nodeCount: workflow.nodes?.length || 0,
      });

      // Calculate confidence score (slightly lower for local AI)
      const confidence = this.calculateConfidenceScore(workflow, prompt) * 0.95;

      return {
        workflow,
        confidence,
        suggestions: this.generateSuggestions(workflow),
        source: 'phi3',
      };
    } catch (error) {
      logger.error('Failed to interpret prompt with local AI', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new ExternalServiceError('Local LLM', error instanceof Error ? error.message : undefined);
    }
  }

  /**
   * Validates a workflow structure
   */
  async validateWorkflow(workflow: Partial<Workflow>): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!workflow.name) {
      errors.push('Workflow name is required');
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    if (!workflow.trigger) {
      errors.push('Workflow must have a trigger node');
    }

    // Check node types
    if (workflow.nodes) {
      for (const node of workflow.nodes) {
        if (!Object.values(NodeType).includes(node.type)) {
          errors.push(`Invalid node type: ${node.type}`);
        }

        if (!node.config || Object.keys(node.config).length === 0) {
          warnings.push(`Node ${node.name} has no configuration`);
        }
      }
    }

    // Check connections
    if (workflow.connections && workflow.nodes) {
      const nodeIds = new Set(workflow.nodes.map((n) => n.id));

      for (const conn of workflow.connections) {
        if (!nodeIds.has(conn.from)) {
          errors.push(`Connection references non-existent node: ${conn.from}`);
        }
        if (!nodeIds.has(conn.to)) {
          errors.push(`Connection references non-existent node: ${conn.to}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Gets AI suggestions for workflow improvement
   */
  async getSuggestions(workflowId: string, userApiKey?: string): Promise<string[]> {
    const workflow = await this.workflowService.getWorkflowById(workflowId);
    const apiKey = userApiKey || config.services.gemini.apiKey || (await this.settingsService.getApiKey('gemini'));

    if (!apiKey) {
      throw new ValidationError('Gemini API key not configured');
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Analyze this workflow and provide 3-5 suggestions for improvement:\n\n${JSON.stringify(workflow, null, 2)}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse suggestions from response
      return text.split('\n').filter((line) => line.trim().length > 0);
    } catch (error) {
      logger.error('Failed to get suggestions', {
        workflowId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ExternalServiceError('Gemini', error instanceof Error ? error.message : undefined);
    }
  }

  /**
   * Builds system prompt for workflow generation
   */
  private buildSystemPrompt(): string {
    return `You are a workflow automation expert. Convert natural language descriptions into structured workflow JSON.

Available node types: ${Object.values(NodeType).join(', ')}

Workflow structure:
{
  "name": "Workflow name",
  "description": "Description",
  "status": "draft",
  "nodes": [
    {
      "id": "unique-id",
      "type": "node_type",
      "name": "Node name",
      "config": { /* node-specific config */ }
    }
  ],
  "connections": [
    { "from": "node-id-1", "to": "node-id-2" }
  ],
  "trigger": { /* trigger node */ }
}

Return ONLY valid JSON, no explanations.`;
  }

  /**
   * Parses workflow from AI response
   */
  private parseWorkflowFromResponse(text: string): Partial<Workflow> {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      throw new ValidationError('Failed to parse workflow JSON from AI response');
    }
  }

  /**
   * Validates generated workflow
   */
  private validateGeneratedWorkflow(workflow: Partial<Workflow>): void {
    if (!workflow.name) {
      throw new ValidationError('Generated workflow missing name');
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new ValidationError('Generated workflow has no nodes');
    }

    if (!workflow.trigger) {
      throw new ValidationError('Generated workflow missing trigger');
    }
  }

  /**
   * Generates suggestions based on workflow
   */
  private generateSuggestions(workflow: Partial<Workflow>): string[] {
    const suggestions: string[] = [];

    if (!workflow.description) {
      suggestions.push('Consider adding a description to document the workflow purpose');
    }

    if (workflow.nodes && workflow.nodes.length > 10) {
      suggestions.push('Workflow has many nodes - consider breaking it into smaller workflows');
    }

    if (!workflow.connections || workflow.connections.length === 0) {
      suggestions.push('Add connections between nodes to define the workflow flow');
    }

    return suggestions;
  }

  /**
   * Calculates confidence score for AI-generated workflow
   * Score is based on completeness, validity, and complexity
   * Returns a value between 0 and 1
   */
  private calculateConfidenceScore(workflow: Partial<Workflow>, prompt: string): number {
    let score = 0;
    let maxScore = 0;

    // Check for required fields (30 points)
    maxScore += 30;
    if (workflow.name) score += 10;
    if (workflow.description) score += 10;
    if (workflow.trigger) score += 10;

    // Check nodes (25 points)
    maxScore += 25;
    if (workflow.nodes && workflow.nodes.length > 0) {
      score += 15;
      // Bonus for reasonable node count (not too few, not too many)
      if (workflow.nodes.length >= 2 && workflow.nodes.length <= 10) {
        score += 10;
      } else if (workflow.nodes.length > 10) {
        score += 5; // Partial credit for complex workflows
      }
    }

    // Check connections (20 points)
    maxScore += 20;
    if (workflow.connections && workflow.connections.length > 0) {
      score += 10;
      // Bonus if connections match node count reasonably
      const expectedConnections = (workflow.nodes?.length || 0) - 1;
      if (workflow.connections.length >= expectedConnections * 0.5) {
        score += 10;
      }
    }

    // Check node configurations (15 points)
    maxScore += 15;
    if (workflow.nodes) {
      const configuredNodes = workflow.nodes.filter(
        (node) => node.config && Object.keys(node.config).length > 0
      );
      const configRatio = configuredNodes.length / workflow.nodes.length;
      score += Math.round(15 * configRatio);
    }

    // Check prompt relevance (10 points)
    maxScore += 10;
    if (workflow.name && prompt) {
      // Simple heuristic: check if workflow name relates to prompt
      const promptWords = prompt.toLowerCase().split(/\s+/);
      const nameWords = workflow.name.toLowerCase().split(/\s+/);
      const overlap = promptWords.filter((word) => nameWords.includes(word)).length;
      if (overlap > 0) {
        score += Math.min(10, overlap * 3);
      }
    }

    // Normalize to 0-1 range
    const normalizedScore = maxScore > 0 ? score / maxScore : 0;

    // Apply penalties for issues
    let penalty = 0;
    if (workflow.nodes && workflow.nodes.some((node) => !node.type || !node.name)) {
      penalty += 0.1; // Invalid nodes
    }
    if (workflow.connections) {
      const nodeIds = new Set(workflow.nodes?.map((n) => n.id) || []);
      const invalidConnections = workflow.connections.filter(
        (conn) => !nodeIds.has(conn.from) || !nodeIds.has(conn.to)
      );
      if (invalidConnections.length > 0) {
        penalty += 0.15; // Invalid connections
      }
    }

    const finalScore = Math.max(0, Math.min(1, normalizedScore - penalty));

    logger.debug('Calculated confidence score', {
      score,
      maxScore,
      normalizedScore,
      penalty,
      finalScore,
    });

    return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Check cache for previous result
   */
  private checkCache(prompt: string): any | null {
    const cached = this.requestCache.get(prompt);

    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < this.CACHE_TTL) {
        return cached.result;
      } else {
        // Expired, remove from cache
        this.requestCache.delete(prompt);
      }
    }

    return null;
  }

  /**
   * Cache a result
   */
  private cacheResult(prompt: string, result: any): void {
    // Maintain cache size limit
    if (this.requestCache.size >= this.CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = this.requestCache.keys().next().value;
      if (firstKey) {
        this.requestCache.delete(firstKey);
      }
    }

    this.requestCache.set(prompt, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Create a timeout promise
   */
  private createTimeout(ms: number, providerName: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${providerName} timeout after ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Queue a request for later processing
   */
  private queueRequest(prompt: string): void {
    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.requestQueue.push({
      id,
      prompt,
      timestamp: Date.now(),
      retries: 0,
    });

    logger.info('Request queued', { id, queueSize: this.requestQueue.length });
  }

  /**
   * Process queued requests (call this periodically)
   */
  async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0) {
      return;
    }

    logger.info('Processing queued requests', { count: this.requestQueue.length });

    const request = this.requestQueue[0];

    try {
      await this.interpretPrompt(request.prompt);

      // Success - remove from queue
      this.requestQueue.shift();
      logger.info('Queued request processed successfully', { id: request.id });
    } catch (error) {
      request.retries++;

      if (request.retries >= 3) {
        // Max retries reached, remove from queue
        this.requestQueue.shift();
        logger.error('Queued request failed after max retries', { id: request.id });
      } else {
        logger.warn('Queued request failed, will retry', {
          id: request.id,
          retries: request.retries,
        });
      }
    }
  }
}

