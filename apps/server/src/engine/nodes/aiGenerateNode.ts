/**
 * AI Generate node handler
 * Generates text using Google Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

import { WorkflowNode, AIGenerateConfig } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { config } from '../../config/environment';
import { logger } from '../../utils/logger';
import { ExternalServiceError, ValidationError } from '../../utils/errors';
import { SettingsService } from '../../services/settingsService';

export class AIGenerateNodeHandler implements NodeHandler {
  private settingsService = new SettingsService();

  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const nodeConfig = node.config as unknown as AIGenerateConfig;

    // Get API key
    const apiKey = config.services.gemini.apiKey || (await this.settingsService.getApiKey('gemini'));

    if (!apiKey) {
      throw new ValidationError('Gemini API key not configured');
    }

    // Replace variables in prompt
    const prompt = this.replaceVariables(nodeConfig.prompt, context);

    logger.info('Generating AI content', {
      nodeId: node.id,
      promptLength: prompt.length,
      model: nodeConfig.model || 'gemini-pro',
    });

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: nodeConfig.model || 'gemini-pro',
      });

      const generationConfig = {
        temperature: nodeConfig.temperature || 0.7,
        maxOutputTokens: nodeConfig.maxTokens || 1024,
      };

      const fullPrompt = nodeConfig.systemPrompt
        ? `${nodeConfig.systemPrompt}\n\n${prompt}`
        : prompt;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig,
      });

      const response = await result.response;
      const text = response.text();

      logger.info('AI content generated', {
        nodeId: node.id,
        responseLength: text.length,
      });

      return {
        text,
        prompt,
        model: nodeConfig.model || 'gemini-pro',
      };
    } catch (error) {
      logger.error('AI generation failed', {
        nodeId: node.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new ExternalServiceError('Gemini', error instanceof Error ? error.message : undefined);
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
}

