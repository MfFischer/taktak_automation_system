/**
 * OpenRouter Service
 * Provides access to multiple LLM models through OpenRouter API
 * Supports Claude, Llama3, Mistral, and more
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: number;
    completion: number;
  };
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';
  private defaultModel = 'anthropic/claude-3-haiku';

  // Popular models for different use cases
  public static readonly MODELS = {
    // Fast and cheap - good for simple tasks
    CLAUDE_HAIKU: 'anthropic/claude-3-haiku',
    LLAMA_3_8B: 'meta-llama/llama-3-8b-instruct',
    
    // Balanced - good for most tasks
    CLAUDE_SONNET: 'anthropic/claude-3-sonnet',
    LLAMA_3_70B: 'meta-llama/llama-3-70b-instruct',
    MISTRAL_MEDIUM: 'mistralai/mistral-medium',
    
    // Powerful - for complex tasks
    CLAUDE_OPUS: 'anthropic/claude-3-opus',
    GPT4_TURBO: 'openai/gpt-4-turbo',
  };

  constructor() {
    this.apiKey = config.services.openRouter.apiKey || '';

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://taktak.app',
        'X-Title': 'Taktak Automation Platform',
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });
  }

  /**
   * Check if OpenRouter is configured
   */
  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== '';
  }

  /**
   * Generate workflow from natural language prompt
   */
  async generateWorkflow(
    prompt: string,
    model: string = this.defaultModel
  ): Promise<string> {
    try {
      logger.info(`OpenRouter: Generating workflow with model ${model}`);

      const response = await this.client.post<OpenRouterResponse>('/chat/completions', {
        model,
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that helps create automation workflows. 
Generate a workflow in JSON format based on the user's description. 
The workflow should include nodes, connections, and a trigger.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in OpenRouter response');
      }

      logger.info('OpenRouter: Workflow generated successfully', {
        model,
        tokens: response.data.usage?.total_tokens,
      });

      return content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('OpenRouter API error:', {
          status: error.response?.status,
          message: error.response?.data?.error?.message || error.message,
        });

        if (error.response?.status === 401) {
          throw new Error('Invalid OpenRouter API key');
        } else if (error.response?.status === 429) {
          throw new Error('OpenRouter rate limit exceeded');
        } else if (error.response?.status === 402) {
          throw new Error('OpenRouter insufficient credits');
        }
      }

      throw new Error(`OpenRouter error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate text completion for any prompt
   */
  async complete(
    prompt: string,
    systemPrompt?: string,
    model: string = this.defaultModel
  ): Promise<string> {
    try {
      const messages: Array<{ role: string; content: string }> = [];

      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      messages.push({ role: 'user', content: prompt });

      const response = await this.client.post<OpenRouterResponse>('/chat/completions', {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in OpenRouter response');
      }

      return content;
    } catch (error) {
      throw new Error(`OpenRouter completion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await this.client.get('/models');
      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to fetch OpenRouter models:', error);
      return [];
    }
  }

  /**
   * Test the connection to OpenRouter
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.complete('Say "OK" if you can read this.', undefined, OpenRouterService.MODELS.CLAUDE_HAIKU);
      return response.toLowerCase().includes('ok');
    } catch (error) {
      logger.error('OpenRouter connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const openRouterService = new OpenRouterService();

