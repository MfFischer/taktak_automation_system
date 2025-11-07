/**
 * AI service for natural language workflow generation
 * Uses Google Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

import { Workflow, NodeType, WorkflowStatus } from '@taktak/types';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { ValidationError, ExternalServiceError } from '../utils/errors';
import { SettingsService } from './settingsService';
import { WorkflowService } from './workflowService';

export class AIService {
  private settingsService = new SettingsService();
  private workflowService = new WorkflowService();

  /**
   * Interprets natural language prompt into workflow
   */
  async interpretPrompt(
    prompt: string,
    userApiKey?: string,
    dryRun: boolean = false
  ): Promise<{ workflow: Partial<Workflow>; confidence: number; suggestions?: string[] }> {
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

      logger.info('Workflow generated from prompt', {
        nodeCount: workflow.nodes?.length || 0,
      });

      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(workflow, prompt);

      return {
        workflow,
        confidence,
        suggestions: this.generateSuggestions(workflow),
      };
    } catch (error) {
      logger.error('Failed to interpret prompt', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ExternalServiceError('Gemini', error instanceof Error ? error.message : undefined);
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
}

