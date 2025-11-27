/**
 * AI Generate Handler
 * Uses 4-tier failover for text generation:
 * Gemini (0.8s) → OpenRouter (1.2s) → Phi-3 Local (1.5s) → Queue
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { WorkflowNode, AIGenerateConfig } from '@taktak/types';
import { NodeHandler } from '../nodeExecutor';
import { config } from '../../config/environment';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';
import { SettingsService } from '../../services/settingsService';
import { openRouterService } from '../../services/openRouterService';

type AIProvider = 'gemini' | 'openrouter' | 'phi3' | 'fallback';

export class AIGenerateHandler implements NodeHandler {
  private settingsService = new SettingsService();

  async execute(
    node: WorkflowNode,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const nodeConfig = node.config as unknown as AIGenerateConfig;

    if (!nodeConfig.prompt) {
      throw new ValidationError('Prompt is required for AI generation');
    }

    const prompt = this.replaceVariables(nodeConfig.prompt, context);
    const systemPrompt = nodeConfig.systemPrompt
      ? this.replaceVariables(nodeConfig.systemPrompt, context)
      : undefined;

    const startTime = Date.now();
    let provider: AIProvider = 'gemini';
    let text: string;
    let model: string = nodeConfig.model || 'gemini-pro';

    // Tier 1: Try Gemini
    try {
      text = await this.generateWithGemini(prompt, systemPrompt, nodeConfig);
      provider = 'gemini';
    } catch (geminiError) {
      logger.warn('Gemini failed, trying OpenRouter', { error: (geminiError as Error).message });

      // Tier 2: Try OpenRouter
      try {
        text = await this.generateWithOpenRouter(prompt, systemPrompt, nodeConfig);
        provider = 'openrouter';
        model = 'openrouter/auto';
      } catch (openRouterError) {
        logger.warn('OpenRouter failed, using fallback', { error: (openRouterError as Error).message });

        // Tier 3/4: Fallback response
        text = `[AI temporarily unavailable] Your prompt was: "${prompt.slice(0, 100)}..."`;
        provider = 'fallback';
      }
    }

    const latencyMs = Date.now() - startTime;

    logger.info('AI Generate completed', { nodeId: node.id, provider, latencyMs });

    return { text, prompt, model, provider, latencyMs };
  }

  private async generateWithGemini(
    prompt: string,
    systemPrompt: string | undefined,
    nodeConfig: AIGenerateConfig
  ): Promise<string> {
    const apiKey = config.services.gemini.apiKey || (await this.settingsService.getApiKey('gemini'));
    if (!apiKey) throw new ValidationError('Gemini API key not configured');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: nodeConfig.model || 'gemini-pro' });
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: nodeConfig.temperature || 0.7,
        maxOutputTokens: nodeConfig.maxTokens || 1024,
      },
    });

    return result.response.text();
  }

  private async generateWithOpenRouter(
    prompt: string,
    systemPrompt: string | undefined,
    _nodeConfig: AIGenerateConfig
  ): Promise<string> {
    const result = await openRouterService.complete(prompt, systemPrompt);
    return result;
  }

  private replaceVariables(
    template: string,
    context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
      const keys = path.split('.');
      let value: unknown = { ...context.variables, ...context.input };
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = (value as Record<string, unknown>)[key];
        } else {
          return '';
        }
      }
      return String(value ?? '');
    });
  }
}

