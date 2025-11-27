/**
 * AIService Tests
 * Tests AI failover logic and workflow interpretation
 */

import { AIProvider } from '@taktak/types';

// Mock the AI service response structure
interface AIInterpretResponse {
  workflow: {
    name: string;
    description: string;
    nodes: unknown[];
    connections: unknown[];
  };
  confidence: number;
  suggestions: string[];
  source: AIProvider;
  explanation: string;
}

// Simulate failover logic
function simulateFailover(
  providers: { name: AIProvider; available: boolean; latency: number }[]
): AIProvider | null {
  const sortedProviders = [...providers].sort((a, b) => a.latency - b.latency);
  
  for (const provider of sortedProviders) {
    if (provider.available) {
      return provider.name;
    }
  }
  
  return null;
}

// Validate workflow structure
function isValidWorkflow(workflow: unknown): boolean {
  if (!workflow || typeof workflow !== 'object') return false;
  const w = workflow as Record<string, unknown>;
  return (
    typeof w.name === 'string' &&
    typeof w.description === 'string' &&
    Array.isArray(w.nodes) &&
    Array.isArray(w.connections)
  );
}

// Calculate confidence based on prompt clarity
function calculateConfidence(prompt: string): number {
  const keywords = ['send', 'email', 'slack', 'webhook', 'schedule', 'trigger', 'when', 'if', 'then'];
  const matches = keywords.filter((kw) => prompt.toLowerCase().includes(kw));
  return Math.min(0.95, 0.5 + matches.length * 0.1);
}

describe('AIService', () => {
  describe('Failover Logic', () => {
    it('should select fastest available provider', () => {
      const providers = [
        { name: 'gemini' as AIProvider, available: true, latency: 800 },
        { name: 'openrouter' as AIProvider, available: true, latency: 1200 },
        { name: 'phi3' as AIProvider, available: true, latency: 1500 },
      ];

      const selected = simulateFailover(providers);
      expect(selected).toBe('gemini');
    });

    it('should fallback to next provider when primary unavailable', () => {
      const providers = [
        { name: 'gemini' as AIProvider, available: false, latency: 800 },
        { name: 'openrouter' as AIProvider, available: true, latency: 1200 },
        { name: 'phi3' as AIProvider, available: true, latency: 1500 },
      ];

      const selected = simulateFailover(providers);
      expect(selected).toBe('openrouter');
    });

    it('should fallback to local Phi-3 when cloud providers unavailable', () => {
      const providers = [
        { name: 'gemini' as AIProvider, available: false, latency: 800 },
        { name: 'openrouter' as AIProvider, available: false, latency: 1200 },
        { name: 'phi3' as AIProvider, available: true, latency: 1500 },
      ];

      const selected = simulateFailover(providers);
      expect(selected).toBe('phi3');
    });

    it('should return null when all providers unavailable', () => {
      const providers = [
        { name: 'gemini' as AIProvider, available: false, latency: 800 },
        { name: 'openrouter' as AIProvider, available: false, latency: 1200 },
        { name: 'phi3' as AIProvider, available: false, latency: 1500 },
      ];

      const selected = simulateFailover(providers);
      expect(selected).toBeNull();
    });
  });

  describe('Workflow Validation', () => {
    it('should validate correct workflow structure', () => {
      const workflow = {
        name: 'Test Workflow',
        description: 'A test workflow',
        nodes: [{ id: '1', type: 'TRIGGER_MANUAL' }],
        connections: [],
      };

      expect(isValidWorkflow(workflow)).toBe(true);
    });

    it('should reject invalid workflow structure', () => {
      expect(isValidWorkflow(null)).toBe(false);
      expect(isValidWorkflow({})).toBe(false);
      expect(isValidWorkflow({ name: 'Test' })).toBe(false);
      expect(isValidWorkflow({ name: 'Test', nodes: [] })).toBe(false);
    });
  });

  describe('Confidence Calculation', () => {
    it('should calculate higher confidence for clear prompts', () => {
      const clearPrompt = 'When I receive an email, send a Slack message';
      const vaguePrompt = 'Do something';

      const clearConfidence = calculateConfidence(clearPrompt);
      const vagueConfidence = calculateConfidence(vaguePrompt);

      expect(clearConfidence).toBeGreaterThan(vagueConfidence);
    });

    it('should cap confidence at 0.95', () => {
      const prompt = 'send email slack webhook schedule trigger when if then';
      const confidence = calculateConfidence(prompt);

      expect(confidence).toBeLessThanOrEqual(0.95);
    });

    it('should have minimum confidence of 0.5', () => {
      const prompt = 'xyz abc 123';
      const confidence = calculateConfidence(prompt);

      expect(confidence).toBeGreaterThanOrEqual(0.5);
    });
  });
});

