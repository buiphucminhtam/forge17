import { describe, it, expect } from 'vitest';
import {
  MockLLMClient,
  GuardedLLMClient,
  createGuardedLLMClient,
  createMockGuardedLLMClient,
} from './llm-client.js';
import { DEFAULT_GUARDRAILS } from './types.js';

describe('LLM Client', () => {
  describe('MockLLMClient', () => {
    it('returns default response', async () => {
      const client = new MockLLMClient();
      const response = await client.generate('test prompt');
      expect(response.content).toBe('Mock response');
    });

    it('returns pattern-matched response for verification', async () => {
      const client = new MockLLMClient();
      const response = await client.generate('verify claim about auth');
      expect(response.content).toContain('VERIFICATION RESULT');
      expect(response.content).toContain('CONFIRMED');
    });

    it('records call history', async () => {
      const client = new MockLLMClient();
      await client.generate('test 1');
      await client.generate('test 2');
      const history = client.getCallHistory();
      expect(history.length).toBe(2);
      expect(history[0].prompt).toBe('test 1');
      expect(history[1].prompt).toBe('test 2');
    });

    it('clears history', async () => {
      const client = new MockLLMClient();
      await client.generate('test');
      client.clearHistory();
      expect(client.getCallHistory()).toEqual([]);
    });

    it('adds custom response pattern', async () => {
      const client = new MockLLMClient();
      client.addResponse(/custom pattern/i, { content: 'Custom response' });
      const response = await client.generate('custom pattern test');
      expect(response.content).toBe('Custom response');
    });

    it('sets default response', async () => {
      const client = new MockLLMClient();
      client.setDefaultResponse({ content: 'Default test response' });
      const response = await client.generate('unmatched pattern xyz');
      expect(response.content).toBe('Default test response');
    });

    it('does not support logits', () => {
      const client = new MockLLMClient();
      expect(client.supportsLogits()).toBe(false);
    });

    it('tracks token usage', async () => {
      const client = new MockLLMClient();
      const response = await client.generate('word1 word2 word3');
      expect(response.usage).toBeDefined();
      expect(response.usage!.inputTokens).toBeGreaterThan(0);
      expect(response.usage!.outputTokens).toBeGreaterThan(0);
    });

    it('returns docs pattern with citations', async () => {
      const client = new MockLLMClient();
      const response = await client.generate('generate docs');
      // This mock response contains citations [source:auth/login.ts:10]
      expect(response.content).toContain('[source:');
    });

    it('returns impact pattern', async () => {
      const client = new MockLLMClient();
      const response = await client.generate('impact analysis');
      expect(response.content).toContain('IMPACT ANALYSIS');
      expect(response.content).toContain('Symbol');
    });
  });

  describe('GuardedLLMClient', () => {
    let mockClient: MockLLMClient;

    beforeEach(() => {
      mockClient = new MockLLMClient();
    });

    it('generates content with guardrails applied', async () => {
      const guarded = new GuardedLLMClient({
        client: mockClient,
        guardrails: DEFAULT_GUARDRAILS,
      });
      const result = await guarded.generate('generate docs');
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('extracts citations from response with citations', async () => {
      mockClient.setDefaultResponse({
        content: 'Use [source:auth/login.ts:42] for login and [source:auth/logout.ts:10] for logout.',
      });
      const guarded = new GuardedLLMClient({
        client: mockClient,
        guardrails: DEFAULT_GUARDRAILS,
      });
      const result = await guarded.generate('test');
      expect(result.citations.length).toBe(2);
      expect(result.citations[0].source).toBe('auth/login.ts');
      expect(result.citations[0].line).toBe(42);
    });

    it('estimates confidence based on citations', async () => {
      mockClient.setDefaultResponse({
        content: 'This is verified [source:auth/login.ts:10].',
      });
      const guarded = new GuardedLLMClient({
        client: mockClient,
        guardrails: DEFAULT_GUARDRAILS,
      });
      const result = await guarded.generate('test');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('lowers confidence for NOT_VERIFIED content', async () => {
      mockClient.setDefaultResponse({
        content: 'This might work [NOT_VERIFIED].',
      });
      const guarded = new GuardedLLMClient({
        client: mockClient,
        guardrails: DEFAULT_GUARDRAILS,
      });
      const result = await guarded.generate('test');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('generates warnings for missing citations when required', async () => {
      mockClient.setDefaultResponse({ content: 'No citations here.' });
      const guarded = new GuardedLLMClient({
        client: mockClient,
        guardrails: { ...DEFAULT_GUARDRAILS, citationRequired: true },
      });
      const result = await guarded.generate('test');
      expect(result.warnings.some(w => w.includes('citation'))).toBe(true);
    });

    it('generates warnings for NOT_VERIFIED content', async () => {
      mockClient.setDefaultResponse({
        content: 'Content with [NOT_VERIFIED] claims.',
      });
      const guarded = new GuardedLLMClient({
        client: mockClient,
        guardrails: DEFAULT_GUARDRAILS,
      });
      const result = await guarded.generate('test');
      expect(result.warnings.some(w => w.includes('unverified'))).toBe(true);
    });

    it('generates with structured context', async () => {
      const guarded = new GuardedLLMClient({
        client: mockClient,
        guardrails: DEFAULT_GUARDRAILS,
      });
      const result = await guarded.generateWithContext({
        system: 'You are a helpful assistant',
        user: 'Explain authentication',
        examples: [
          { input: 'What is auth?', output: 'Authentication is...' }
        ],
      });
      expect(result.content).toBeDefined();
    });

    it('includes model in result', async () => {
      const guarded = new GuardedLLMClient({
        client: mockClient,
        guardrails: DEFAULT_GUARDRAILS,
      });
      const result = await guarded.generate('test');
      expect(result.model).toBe('mock');
    });

    it('includes usage info in result', async () => {
      const guarded = new GuardedLLMClient({
        client: mockClient,
        guardrails: DEFAULT_GUARDRAILS,
      });
      const result = await guarded.generate('test');
      expect(result.usage).toBeDefined();
      expect(result.usage!.inputTokens).toBeGreaterThan(0);
    });

    it('marks verified for high confidence', async () => {
      mockClient.setDefaultResponse({
        content: 'CONFIRMED [source:a.ts:1] [source:b.ts:2] [source:c.ts:3] verified.',
      });
      const guarded = new GuardedLLMClient({
        client: mockClient,
        guardrails: DEFAULT_GUARDRAILS,
      });
      const result = await guarded.generate('test');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('createGuardedLLMClient', () => {
    it('creates anthropic client', () => {
      const client = createGuardedLLMClient('anthropic', {});
      expect(client).toBeInstanceOf(GuardedLLMClient);
    });

    it('creates openai client', () => {
      const client = createGuardedLLMClient('openai', {});
      expect(client).toBeInstanceOf(GuardedLLMClient);
    });

    it('creates ollama client', () => {
      const client = createGuardedLLMClient('ollama', {});
      expect(client).toBeInstanceOf(GuardedLLMClient);
    });

    it('throws for unsupported provider', () => {
      expect(() => createGuardedLLMClient('google' as any, {}))
        .toThrow('Unsupported provider');
    });
  });

  describe('createMockGuardedLLMClient', () => {
    it('creates mock client', () => {
      const client = createMockGuardedLLMClient();
      expect(client).toBeInstanceOf(GuardedLLMClient);
    });

    it('generates with default guardrails', async () => {
      const client = createMockGuardedLLMClient();
      const result = await client.generate('test');
      expect(result.content).toBeDefined();
    });
  });
});