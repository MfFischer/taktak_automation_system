/**
 * Local LLM Service
 * Provides offline AI capabilities using Phi-3 via llama.cpp
 * Using node-llama-cpp v3.x API (ESM)
 */

import { getLlama, LlamaModel, LlamaContext, LlamaChatSession } from 'node-llama-cpp';
import { logger } from '../utils/logger.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LocalLLMConfig {
  modelPath: string;
  contextSize: number;
  maxTokens: number;
}

class LocalLLMService {
  private model: LlamaModel | null = null;
  private context: LlamaContext | null = null;
  private session: LlamaChatSession | null = null;
  private config: LocalLLMConfig;
  private isInitialized = false;

  constructor() {
    // Default model path is relative to the server app directory
    const defaultModelPath = path.resolve(__dirname, '../../models/phi-3-mini-4k-instruct-q4.gguf');

    this.config = {
      modelPath: process.env.LOCAL_LLM_MODEL_PATH || defaultModelPath,
      contextSize: parseInt(process.env.LOCAL_LLM_CONTEXT_SIZE || '4096', 10),
      maxTokens: parseInt(process.env.LOCAL_LLM_MAX_TOKENS || '2048', 10),
    };
  }

  /**
   * Initialize the local LLM model
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('Local LLM already initialized');
      return;
    }

    try {
      // Check if model file exists
      const modelPath = path.resolve(this.config.modelPath);
      if (!fs.existsSync(modelPath)) {
        throw new Error(
          `Model file not found at ${modelPath}. Please download Phi-3 model. See apps/server/models/README.md for instructions.`
        );
      }

      logger.info('Initializing local LLM', { modelPath });

      // Get llama instance (v3.x API)
      const llama = await getLlama();

      // Load the model
      this.model = await llama.loadModel({
        modelPath,
      });

      // Create context
      this.context = await this.model.createContext({
        contextSize: this.config.contextSize,
      });

      // Create chat session
      this.session = new LlamaChatSession({
        contextSequence: this.context.getSequence(),
      });

      this.isInitialized = true;
      logger.info('Local LLM initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize local LLM', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if local LLM is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.model !== null && this.context !== null;
  }

  /**
   * Generate text using local LLM
   */
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.isAvailable()) {
      await this.initialize();
    }

    if (!this.session) {
      throw new Error('Local LLM session not initialized');
    }

    try {
      logger.info('Generating text with local LLM', {
        promptLength: prompt.length,
      });

      // Combine system prompt and user prompt if provided
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`
        : prompt;

      // Generate response using the session (v3.x API)
      const response = await this.session.prompt(fullPrompt, {
        maxTokens: this.config.maxTokens,
      });

      logger.info('Local LLM generation completed', {
        responseLength: response.length,
      });

      return response;
    } catch (error) {
      logger.error('Local LLM generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate workflow JSON from natural language prompt
   */
  async interpretPrompt(prompt: string): Promise<string> {
    const systemPrompt = `You are an AI assistant that converts natural language descriptions into workflow JSON.
Your task is to analyze the user's request and generate a valid workflow configuration.

Output ONLY valid JSON in this exact format:
{
  "name": "Workflow Name",
  "description": "Brief description",
  "trigger": {"type": "manual"},
  "nodes": [
    {
      "id": "node1",
      "type": "SEND_EMAIL",
      "name": "Send Email",
      "config": {"to": "user@example.com", "subject": "Subject", "body": "Body"}
    }
  ],
  "connections": [
    {"from": "node1", "to": "node2"}
  ]
}

Available node types: SCHEDULE, WEBHOOK, SEND_SMS, SEND_EMAIL, DATABASE_QUERY, CONDITION, AI_GENERATE, HTTP_REQUEST, CSV_PARSE, TRANSFORM_DATA

Rules:
1. Output ONLY JSON, no explanations
2. Use valid node types from the list above
3. Include all required config fields for each node type
4. Create logical connections between nodes
5. Start with a trigger node if needed`;

    const response = await this.generate(prompt, systemPrompt);

    // Extract JSON from response (in case model adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from local LLM response');
    }

    return jsonMatch[0];
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
    if (this.model) {
      await this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
    logger.info('Local LLM cleaned up');
  }
}

// Export singleton instance
export const localLLMService = new LocalLLMService();

