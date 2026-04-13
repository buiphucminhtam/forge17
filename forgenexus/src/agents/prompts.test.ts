import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CITATION_PATTERN,
  extractCitations,
  buildVerificationPrompt,
  buildSynthesisPrompt,
  applyGuardrails,
  parseVerificationResponse,
  extractConfidenceScore,
} from './prompts.js';

describe('Agent Prompts', () => {
  describe('CITATION_PATTERN', () => {
    it('matches standard citation format', () => {
      const text = 'See [source:src/auth/login.ts:42] for details';
      const matches = [...text.matchAll(new RegExp(CITATION_PATTERN))];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe('src/auth/login.ts');
      expect(matches[0][2]).toBe('42');
    });

    it('matches citation without line number', () => {
      const text = 'See [source:src/utils/helper.ts] for more';
      const matches = [...text.matchAll(new RegExp(CITATION_PATTERN))];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe('src/utils/helper.ts');
      expect(matches[0][2]).toBeUndefined();
    });

    it('matches multiple citations', () => {
      const text = '[source:file1.ts:10] and [source:file2.ts:20]';
      const matches = [...text.matchAll(new RegExp(CITATION_PATTERN))];
      expect(matches.length).toBe(2);
    });

    it('does not match malformed citations', () => {
      const text = 'No citation here [bad format]';
      const matches = [...text.matchAll(new RegExp(CITATION_PATTERN))];
      expect(matches.length).toBe(0);
    });
  });

  describe('extractCitations', () => {
    it('extracts all citations from text', () => {
      const text = 'Use [source:auth/login.ts:10] for login. See [source:auth/logout.ts:5] for logout.';
      const citations = extractCitations(text);
      expect(citations.length).toBe(2);
      expect(citations[0].source).toBe('auth/login.ts');
      expect(citations[0].line).toBe(10);
      expect(citations[1].source).toBe('auth/logout.ts');
      expect(citations[1].line).toBe(5);
    });

    it('handles citation without line number', () => {
      const text = 'See [source:README.md] for documentation';
      const citations = extractCitations(text);
      expect(citations.length).toBe(1);
      expect(citations[0].source).toBe('README.md');
      expect(citations[0].line).toBeUndefined();
    });

    it('returns empty array for text without citations', () => {
      const text = 'No citations here';
      const citations = extractCitations(text);
      expect(citations).toEqual([]);
    });

    it('includes full match in result', () => {
      const text = '[source:example.ts:1]';
      const citations = extractCitations(text);
      expect(citations[0].full).toBe('[source:example.ts:1]');
    });
  });

  describe('buildVerificationPrompt', () => {
    it('includes all claims in prompt', () => {
      const prompt = buildVerificationPrompt({
        claims: ['Claim 1', 'Claim 2'],
        evidence: 'Evidence text',
      });
      expect(prompt).toContain('Claim 1');
      expect(prompt).toContain('Claim 2');
      expect(prompt).toContain('Evidence text');
      expect(prompt).toContain('CONFIRMED');
      expect(prompt).toContain('UNCERTAIN');
    });

    it('includes optional context', () => {
      const prompt = buildVerificationPrompt({
        claims: ['Claim'],
        evidence: 'Evidence',
        context: 'Additional context',
      });
      expect(prompt).toContain('Additional Context');
      expect(prompt).toContain('Additional context');
    });

    it('excludes context section when not provided', () => {
      const prompt = buildVerificationPrompt({
        claims: ['Claim'],
        evidence: 'Evidence',
      });
      expect(prompt).not.toContain('### Additional Context');
    });
  });

  describe('buildSynthesisPrompt', () => {
    it('includes task and evidence', () => {
      const wikiPrompt = buildSynthesisPrompt({
        type: 'wiki',
        task: 'Document auth module',
        evidence: 'Auth code',
        constraints: ['citationRequired'],
      });
      expect(wikiPrompt).toContain('Document auth module');
      expect(wikiPrompt).toContain('Auth code');
    });

    it('includes constraints in prompt', () => {
      const prompt = buildSynthesisPrompt({
        type: 'query',
        task: 'Find files',
        evidence: 'Results',
        constraints: ['Do not guess'],
      });
      expect(prompt).toContain('Do not guess');
    });
  });

  describe('applyGuardrails', () => {
    it('adds constraints to base prompt', () => {
      const guardrails = {
        constraints: ['Only use provided evidence', 'Cite sources'],
        citationRequired: true,
        calibration: 'strict' as const,
        fallbackBehavior: 'refuse' as const,
      };
      const result = applyGuardrails('Base prompt content', guardrails);
      expect(result).toContain('Only use provided evidence');
      expect(result).toContain('Cite sources');
    });

    it('adds calibration note for strict mode', () => {
      const guardrails = {
        constraints: [],
        citationRequired: false,
        calibration: 'strict' as const,
        fallbackBehavior: 'best_effort' as const,
      };
      const result = applyGuardrails('Prompt', guardrails);
      expect(result).toContain('Be very conservative');
      expect(result).toContain('High confidence only');
    });

    it('adds calibration note for lenient mode', () => {
      const guardrails = {
        constraints: [],
        citationRequired: false,
        calibration: 'lenient' as const,
        fallbackBehavior: 'best_effort' as const,
      };
      const result = applyGuardrails('Prompt', guardrails);
      expect(result).toContain('Accept reasonable inferences');
    });

    it('adds citation requirement when enabled', () => {
      const guardrails = {
        constraints: [],
        citationRequired: true,
        calibration: 'moderate' as const,
        fallbackBehavior: 'best_effort' as const,
      };
      const result = applyGuardrails('Prompt', guardrails);
      expect(result).toContain('Citation Requirement');
      expect(result).toContain('MUST have inline citations');
    });

    it('handles refuse fallback behavior', () => {
      const guardrails = {
        constraints: [],
        citationRequired: false,
        calibration: 'moderate' as const,
        fallbackBehavior: 'refuse' as const,
      };
      const result = applyGuardrails('Prompt', guardrails);
      expect(result).toContain('UNABLE_TO_VERIFY');
    });

    it('handles clarify fallback behavior', () => {
      const guardrails = {
        constraints: [],
        citationRequired: false,
        calibration: 'moderate' as const,
        fallbackBehavior: 'clarify' as const,
      };
      const result = applyGuardrails('Prompt', guardrails);
      expect(result).toContain('ask for clarification');
    });
  });

  describe('parseVerificationResponse', () => {
    it('parses confirmed status', () => {
      const response = `CLAIM 1: Some claim
STATUS: CONFIRMED
REASONING: Evidence supports it
EVIDENCE: Found in code
ISSUES: None`;
      const result = parseVerificationResponse(response);
      expect(result.status).toBe('confirmed');
    });

    it('parses unconfirmed status', () => {
      const response = `STATUS: UNCONFIRMED
REASONING: Evidence contradicts
EVIDENCE: Different behavior found
ISSUES: Wrong description`;
      const result = parseVerificationResponse(response);
      expect(result.status).toBe('unconfirmed');
    });

    it('parses uncertain status', () => {
      const response = `STATUS: UNCERTAIN
REASONING: Not enough evidence
EVIDENCE: Partial match only
ISSUES: Need more data`;
      const result = parseVerificationResponse(response);
      expect(result.status).toBe('uncertain');
    });

    it('returns uncertain for invalid status', () => {
      const response = `STATUS: INVALID_STATUS
REASONING: Something
EVIDENCE: None
ISSUES: None`;
      const result = parseVerificationResponse(response);
      expect(result.status).toBe('uncertain');
    });

    it('extracts evidence from EVIDENCE section', () => {
      const response = `EVIDENCE: Evidence line 1
Evidence: Evidence line 2
Evidence: Evidence line 3
ISSUES: None`;
      const result = parseVerificationResponse(response);
      expect(result.evidence.length).toBeGreaterThan(0);
    });

    it('extracts issues lines', () => {
      const response = `EVIDENCE: ok
ISSUES: Issue 1
Issue 2`;
      const result = parseVerificationResponse(response);
      expect(result.issues).toContain('Issue 1');
      expect(result.issues).toContain('Issue 2');
    });
  });

  describe('extractConfidenceScore', () => {
    it('extracts numeric score 0.85', () => {
      const score = extractConfidenceScore('confidence: 0.85');
      expect(score).toBe(0.85);
    });

    it('extracts numeric score 0.7', () => {
      const score = extractConfidenceScore('confidence score: 0.7');
      expect(score).toBe(0.7);
    });

    it('extracts score 0.95 from confidence score format', () => {
      const score = extractConfidenceScore('confidence score: 0.95');
      expect(score).toBe(0.95);
    });

    it('returns fallback keywords for strong indicators', () => {
      const score1 = extractConfidenceScore('very high confidence');
      expect(score1).toBeGreaterThanOrEqual(0.9);
    });

    it('returns lower score for uncertain text', () => {
      const score = extractConfidenceScore('uncertain about this');
      expect(score).toBeLessThan(0.5);
    });

    it('returns default 0.5 for unknown text', () => {
      expect(extractConfidenceScore('random text')).toBe(0.5);
    });
  });
});