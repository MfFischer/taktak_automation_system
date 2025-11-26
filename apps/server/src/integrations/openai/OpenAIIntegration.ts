/**
 * OpenAI Integration
 * Supports GPT-4, embeddings, and assistants
 */

import { WorkflowNode } from '@taktak/types';
import { BaseIntegration, AuthType, IntegrationConfig, AuthCredentials } from '../base/BaseIntegration';
import { logger } from '../../utils/logger';

export class OpenAIIntegration extends BaseIntegration {
  constructor(credentials: AuthCredentials) {
    const config: IntegrationConfig = {
      name: 'OpenAI',
      authType: AuthType.API_KEY,
      baseUrl: 'https://api.openai.com/v1',
    };
    super(config, credentials);
  }

  async execute(
    node: WorkflowNode,
    _context: { input: Record<string, unknown>; variables: Record<string, unknown> }
  ): Promise<unknown> {
    const { operation } = node.config;

    logger.info('Executing OpenAI operation', { operation });

    switch (operation) {
      case 'chatCompletion':
        return this.chatCompletion(node.config);

      case 'createEmbedding':
        return this.createEmbedding(node.config);

      case 'generateImage':
        return this.generateImage(node.config);

      case 'transcribeAudio':
        return this.transcribeAudio(node.config);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  protected async testConnection(): Promise<void> {
    await this.makeRequest('/models', { method: 'GET' });
  }

  /**
   * Chat completion (GPT-4, GPT-3.5)
   */
  private async chatCompletion(params: any): Promise<any> {
    const {
      model = 'gpt-4',
      messages,
      temperature = 0.7,
      maxTokens = 1000,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
    } = params;

    const response = await this.retryWithBackoff(() =>
      this.makeRequest('/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
        }),
      })
    );

    return {
      content: response.choices[0].message.content,
      role: response.choices[0].message.role,
      finishReason: response.choices[0].finish_reason,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  }

  /**
   * Create embeddings
   */
  private async createEmbedding(params: any): Promise<any> {
    const { input, model = 'text-embedding-ada-002' } = params;

    const response = await this.retryWithBackoff(() =>
      this.makeRequest('/embeddings', {
        method: 'POST',
        body: JSON.stringify({ input, model }),
      })
    );

    return {
      embedding: response.data[0].embedding,
      model: response.model,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens,
      },
    };
  }

  /**
   * Generate image (DALL-E)
   */
  private async generateImage(params: any): Promise<any> {
    const {
      prompt,
      model = 'dall-e-3',
      size = '1024x1024',
      quality = 'standard',
      n = 1,
    } = params;

    const response = await this.retryWithBackoff(() =>
      this.makeRequest('/images/generations', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          model,
          size,
          quality,
          n,
        }),
      })
    );

    return {
      images: response.data.map((img: any) => ({
        url: img.url,
        revisedPrompt: img.revised_prompt,
      })),
    };
  }

  /**
   * Transcribe audio (Whisper)
   */
  private async transcribeAudio(params: any): Promise<any> {
    const { audioFile, model = 'whisper-1', language } = params;

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', model);
    if (language) formData.append('language', language);

    const response = await this.retryWithBackoff(() =>
      this.makeRequest('/audio/transcriptions', {
        method: 'POST',
        body: formData as any,
        headers: {
          'Content-Type': 'multipart/form-data',
        } as any,
      })
    );

    return {
      text: response.text,
      language: response.language,
    };
  }
}

