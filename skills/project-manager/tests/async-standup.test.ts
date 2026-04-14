import type { AsyncStandupEntry } from './mocks/types';

// Parser for async standup format validation
export class AsyncStandupParser {
  private static readonly MAX_CHARS = 500;
  private static readonly REQUIRED_SECTIONS = ['yesterday', 'today', 'blockers'];

  static parse(input: string): AsyncStandupEntry {
    const lines = input.trim().split('\n');
    const entry: AsyncStandupEntry = {
      member: '',
      date: '',
      yesterday: [],
      today: [],
      blockers: [],
    };

    let currentSection: 'member' | 'date' | 'yesterday' | 'today' | 'blockers' | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const lowerLine = trimmed.toLowerCase();

      if (lowerLine.startsWith('member:') || lowerLine.startsWith('name:') || lowerLine.startsWith('author:')) {
        entry.member = trimmed.split(':').slice(1).join(':').trim();
        currentSection = 'member';
      } else if (lowerLine.startsWith('date:')) {
        entry.date = trimmed.split(':').slice(1).join(':').trim();
        currentSection = 'date';
      } else if (lowerLine.startsWith('yesterday:') || lowerLine.startsWith('done:') || lowerLine.startsWith('completed:')) {
        currentSection = 'yesterday';
        const value = trimmed.split(':').slice(1).join(':').trim();
        if (value) entry.yesterday.push(value);
      } else if (lowerLine.startsWith('today:') || lowerLine.startsWith('planned:') || lowerLine.startsWith('doing:')) {
        currentSection = 'today';
        const value = trimmed.split(':').slice(1).join(':').trim();
        if (value) entry.today.push(value);
      } else if (lowerLine.startsWith('blockers:') || lowerLine.startsWith('blocked:') || lowerLine.startsWith('issues:')) {
        currentSection = 'blockers';
        const value = trimmed.split(':').slice(1).join(':').trim();
        if (value) entry.blockers.push(value);
      } else if (currentSection === 'yesterday') {
        entry.yesterday.push(trimmed);
      } else if (currentSection === 'today') {
        entry.today.push(trimmed);
      } else if (currentSection === 'blockers') {
        entry.blockers.push(trimmed);
      }
    }

    return entry;
  }

  static validate(entry: AsyncStandupEntry): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!entry.member) {
      errors.push('Missing member name');
    }

    if (!entry.date) {
      errors.push('Missing date');
    }

    if (entry.yesterday.length === 0 && entry.today.length === 0) {
      errors.push('At least one section must have content');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static truncate(text: string, maxChars: number = 500): string {
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars - 3) + '...';
  }

  static sanitize(text: string): string {
    return text
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .trim();
  }

  static hasUnicode(text: string): boolean {
    return /[^\x00-\x7F]/.test(text);
  }
}

// AI Summary Generator for async standups
export class AISummaryGenerator {
  static generate(entries: AsyncStandupEntry[]): string {
    if (entries.length === 0) {
      return 'No standup entries to summarize.';
    }

    const summaries: string[] = [];

    for (const entry of entries) {
      let summary = `**${entry.member || 'Unknown'}** (${entry.date}):\n`;

      if (entry.yesterday.length > 0) {
        summary += `- Yesterday: ${entry.yesterday.join(', ')}\n`;
      }

      if (entry.today.length > 0) {
        summary += `- Today: ${entry.today.join(', ')}\n`;
      }

      if (entry.blockers.length > 0) {
        summary += `- Blockers: ${entry.blockers.join(', ')}\n`;
      } else {
        summary += '- Blockers: None\n';
      }

      summaries.push(summary);
    }

    return summaries.join('\n---\n');
  }

  static generateRiskSummary(blockers: string[]): string {
    if (blockers.length === 0) {
      return 'No blockers reported. Team is unblocked.';
    }

    const criticalKeywords = ['critical', 'blocker', 'stuck', 'cannot proceed'];
    const highPriorityBlockers = blockers.filter(b =>
      criticalKeywords.some(kw => b.toLowerCase().includes(kw))
    );

    if (highPriorityBlockers.length > 0) {
      return `🚨 **Critical Blockers:**\n${highPriorityBlockers.map(b => `- ${b}`).join('\n')}`;
    }

    return `⚠️ **Blockers:**\n${blockers.map(b => `- ${b}`).join('\n')}`;
  }
}

describe('AsyncStandupParser', () => {
  describe('should parse valid standup format', () => {
    it('should parse standard format with all sections', () => {
      const input = `Member: alice
Date: 2024-01-18
Yesterday: Completed login form
Today: Add password reset
Blockers: None`;

      const entry = AsyncStandupParser.parse(input);

      expect(entry.member).toBe('alice');
      expect(entry.date).toBe('2024-01-18');
      expect(entry.yesterday).toContain('Completed login form');
      expect(entry.today).toContain('Add password reset');
      expect(entry.blockers).toContain('None');
    });

    it('should parse alternative section names', () => {
      const input = `Name: bob
Done: Task 1
Planned: Task 2
Issues: None`;

      const entry = AsyncStandupParser.parse(input);

      expect(entry.member).toBe('bob');
      expect(entry.yesterday).toContain('Task 1');
      expect(entry.today).toContain('Task 2');
      expect(entry.blockers).toContain('None');
    });

    it('should handle multi-line sections', () => {
      const input = `Author: charlie
Date: 2024-01-18
Yesterday:
  - Feature A implemented
  - Tests passing
Today:
  - Feature B planning`;

      const entry = AsyncStandupParser.parse(input);

      expect(entry.member).toBe('charlie');
      expect(entry.yesterday.length).toBeGreaterThanOrEqual(1);
      expect(entry.today.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('should reject invalid format', () => {
    it('should fail validation when missing member', () => {
      const input = `Date: 2024-01-18
Yesterday: Test
Today: Test`;

      const entry = AsyncStandupParser.parse(input);
      const validation = AsyncStandupParser.validate(entry);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Missing member name');
    });

    it('should fail validation when missing date', () => {
      const input = `Member: alice
Yesterday: Test
Today: Test`;

      const entry = AsyncStandupParser.parse(input);
      const validation = AsyncStandupParser.validate(entry);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Missing date');
    });

    it('should fail validation when all sections empty', () => {
      const input = `Member: alice
Date: 2024-01-18`;

      const entry = AsyncStandupParser.parse(input);
      const validation = AsyncStandupParser.validate(entry);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('At least one section must have content');
    });
  });

  describe('should handle edge cases', () => {
    it('should handle empty input gracefully', () => {
      const entry = AsyncStandupParser.parse('');

      expect(entry.member).toBe('');
      expect(entry.date).toBe('');
      expect(entry.yesterday).toEqual([]);
    });

    it('should handle unicode characters', () => {
      const input = `Member: 張三
Date: 2024-01-18
Yesterday: 完成了登录表单
Today: 添加密码重置功能`;

      const entry = AsyncStandupParser.parse(input);

      expect(entry.member).toBe('張三');
      expect(AsyncStandupParser.hasUnicode(input)).toBe(true);
    });

    it('should handle special characters', () => {
      const input = `Member: alice
Date: 2024-01-18
Yesterday: Fixed <script>alert('xss')</script>
Today: Working on test & QA`;

      const entry = AsyncStandupParser.parse(input);
      const sanitized = AsyncStandupParser.sanitize(entry.yesterday[0]);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
    });

    it('should truncate long text to 500 chars', () => {
      const longText = 'A'.repeat(600);
      const truncated = AsyncStandupParser.truncate(longText);

      expect(truncated.length).toBe(500);
      expect(truncated.endsWith('...')).toBe(true);
    });

    it('should not truncate short text', () => {
      const shortText = 'Short task description';
      const truncated = AsyncStandupParser.truncate(shortText);

      expect(truncated).toBe(shortText);
    });
  });
});

describe('AISummaryGenerator', () => {
  describe('should generate summaries', () => {
    it('should generate summary for single entry', () => {
      const entries: AsyncStandupEntry[] = [{
        member: 'alice',
        date: '2024-01-18',
        yesterday: ['Task 1'],
        today: ['Task 2'],
        blockers: [],
      }];

      const summary = AISummaryGenerator.generate(entries);

      expect(summary).toContain('alice');
      expect(summary).toContain('Task 1');
      expect(summary).toContain('Task 2');
    });

    it('should generate summary for multiple entries', () => {
      const entries: AsyncStandupEntry[] = [
        { member: 'alice', date: '2024-01-18', yesterday: ['A'], today: ['B'], blockers: [] },
        { member: 'bob', date: '2024-01-18', yesterday: ['C'], today: ['D'], blockers: ['E'] },
      ];

      const summary = AISummaryGenerator.generate(entries);

      expect(summary).toContain('alice');
      expect(summary).toContain('bob');
      expect(summary).toContain('Blockers: None');
      expect(summary).toContain('Blockers: E');
    });

    it('should handle empty entries array', () => {
      const summary = AISummaryGenerator.generate([]);

      expect(summary).toBe('No standup entries to summarize.');
    });
  });

  describe('should generate risk summaries', () => {
    it('should identify critical blockers', () => {
      const blockers = ['Critical blocker affecting deployment', 'Stuck on API issue'];
      const summary = AISummaryGenerator.generateRiskSummary(blockers);

      expect(summary).toContain('Critical Blockers');
    });

    it('should show no blockers when clean', () => {
      const summary = AISummaryGenerator.generateRiskSummary([]);

      expect(summary).toBe('No blockers reported. Team is unblocked.');
    });

    it('should list regular blockers', () => {
      const blockers = ['Waiting for design review', 'Need test environment'];
      const summary = AISummaryGenerator.generateRiskSummary(blockers);

      expect(summary).toContain('Blockers');
      expect(summary).toContain('Waiting for design review');
    });
  });
});
