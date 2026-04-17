/**
 * Token Tracker Module for ForgeWright
 * 
 * Logs LLM usage to per-project JSONL files for analysis.
 * Location: ~/.forgewright/usage/{project}/{date}.jsonl
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface TokenUsage {
  timestamp: string;
  sessionId?: string;
  project: string;
  projectPath: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  skill?: string;
  mode?: string;
}

export interface TokenError {
  timestamp: string;
  sessionId?: string;
  project: string;
  projectPath: string;
  model: string;
  provider: string;
  error: string;
  errorType: string;
}

export interface TokenSummary {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCalls: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  byProvider: Record<string, ProviderStats>;
  byModel: Record<string, ModelStats>;
}

interface ProviderStats {
  input: number;
  output: number;
  calls: number;
  cost: number;
}

interface ModelStats {
  input: number;
  output: number;
  calls: number;
  cost: number;
}

// Provider pricing (USD per 1M tokens)
const PRICING: Record<string, Record<string, { input: number; output: number }>> = {
  anthropic: {
    'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
    'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
    'claude-3-opus-20240229': { input: 15.0, output: 75.0 },
    'claude-3-opus': { input: 15.0, output: 75.0 },
    'claude-3-sonnet-20240229': { input: 3.0, output: 15.0 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    'claude-3-haiku': { input: 0.25, output: 1.25 },
    'claude-3-5-haiku-20241022': { input: 0.8, output: 4.0 },
    'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  },
  openai: {
    'gpt-4o': { input: 2.5, output: 10.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4-turbo': { input: 10.0, output: 30.0 },
    'gpt-4': { input: 30.0, output: 60.0 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  },
  google: {
    'gemini-2.5-pro': { input: 1.25, output: 5.0 },
    'gemini-2.5-flash': { input: 0.075, output: 0.30 },
    'gemini-2.0-flash': { input: 0.0, output: 0.0 },
    'gemini-1.5-pro': { input: 1.25, output: 5.0 },
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  },
};

export class TokenTracker {
  private logDir: string;
  private enabled: boolean;
  private projectName: string;
  private projectPath: string;

  constructor(projectPath?: string) {
    this.projectPath = projectPath || process.cwd();
    this.projectName = path.basename(this.projectPath);
    
    // Check if tracking is disabled
    this.enabled = process.env.FORGEWRIGHT_TOKEN_TRACKING !== 'disabled';
    
    if (this.enabled) {
      const home = os.homedir();
      this.logDir = path.join(home, '.forgewright', 'usage', this.projectName);
      
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } else {
      this.logDir = '';
    }
  }

  /**
   * Log a token usage event
   */
  log(usage: TokenUsage): void {
    if (!this.enabled) return;

    const file = path.join(this.logDir, `${this.getDate()}.jsonl`);
    const record = {
      timestamp: usage.timestamp,
      sessionId: usage.sessionId || process.env.FORGEWRIGHT_SESSION_ID || 'unknown',
      project: this.projectName,
      projectPath: this.projectPath,
      model: usage.model,
      provider: usage.provider,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      latencyMs: usage.latencyMs,
      skill: usage.skill,
      mode: usage.mode,
    };

    try {
      fs.appendFileSync(file, JSON.stringify(record) + '\n');
    } catch (err) {
      console.error('[TokenTracker] Failed to write log:', err);
    }
  }

  /**
   * Log an error event
   */
  logError(error: TokenError): void {
    if (!this.enabled) return;

    const file = path.join(this.logDir, `errors-${this.getDate()}.jsonl`);
    const record = {
      timestamp: error.timestamp,
      sessionId: error.sessionId || process.env.FORGEWRIGHT_SESSION_ID || 'unknown',
      project: this.projectName,
      projectPath: this.projectPath,
      model: error.model,
      provider: error.provider,
      error: error.error,
      errorType: error.errorType,
    };

    try {
      fs.appendFileSync(file, JSON.stringify(record) + '\n');
    } catch (err) {
      console.error('[TokenTracker] Failed to write error log:', err);
    }
  }

  /**
   * Get all usage records for a date range
   */
  getRecords(days: number = 7): TokenUsage[] {
    const records: TokenUsage[] = [];
    
    if (!fs.existsSync(this.logDir)) {
      return records;
    }

    for (let i = 0; i < days; i++) {
      const date = this.getDateOffset(i);
      const file = path.join(this.logDir, `${date}.jsonl`);
      
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            records.push(JSON.parse(line));
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }

    return records;
  }

  /**
   * Calculate cost for a usage record
   */
  calculateCost(record: TokenUsage): number {
    const providerPrices = PRICING[record.provider];
    if (!providerPrices) return 0;

    // Try exact model match first, then partial match
    let prices = providerPrices[record.model];
    if (!prices) {
      // Try partial match (e.g., "claude-3-5-sonnet" matches "claude-3-5-sonnet-20241022")
      const modelPrefix = record.model.split('-').slice(0, 4).join('-');
      for (const [key, value] of Object.entries(providerPrices)) {
        if (key.startsWith(modelPrefix)) {
          prices = value;
          break;
        }
      }
    }

    if (!prices) return 0;

    const inputCost = (record.inputTokens / 1_000_000) * prices.input;
    const outputCost = (record.outputTokens / 1_000_000) * prices.output;
    return inputCost + outputCost;
  }

  /**
   * Generate summary statistics
   */
  getSummary(days: number = 7): TokenSummary {
    const records = this.getRecords(days);
    
    const summary: TokenSummary = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCalls: records.length,
      totalCostUsd: 0,
      avgLatencyMs: 0,
      byProvider: {},
      byModel: {},
    };

    let totalLatency = 0;

    for (const record of records) {
      summary.totalInputTokens += record.inputTokens;
      summary.totalOutputTokens += record.outputTokens;
      totalLatency += record.latencyMs;
      
      const cost = this.calculateCost(record);
      summary.totalCostUsd += cost;

      // By provider
      if (!summary.byProvider[record.provider]) {
        summary.byProvider[record.provider] = { input: 0, output: 0, calls: 0, cost: 0 };
      }
      summary.byProvider[record.provider].input += record.inputTokens;
      summary.byProvider[record.provider].output += record.outputTokens;
      summary.byProvider[record.provider].calls += 1;
      summary.byProvider[record.provider].cost += cost;

      // By model
      if (!summary.byModel[record.model]) {
        summary.byModel[record.model] = { input: 0, output: 0, calls: 0, cost: 0 };
      }
      summary.byModel[record.model].input += record.inputTokens;
      summary.byModel[record.model].output += record.outputTokens;
      summary.byModel[record.model].calls += 1;
      summary.byModel[record.model].cost += cost;
    }

    summary.totalTokens = summary.totalInputTokens + summary.totalOutputTokens;
    summary.totalCostUsd = Math.round(summary.totalCostUsd * 10000) / 10000; // 4 decimal places
    summary.avgLatencyMs = records.length > 0 ? Math.round(totalLatency / records.length) : 0;

    return summary;
  }

  /**
   * Get daily usage for trend analysis
   */
  getDailyUsage(days: number = 7): Array<{
    date: string;
    inputTokens: number;
    outputTokens: number;
    calls: number;
    cost: number;
  }> {
    const dailyData: Record<string, { input: number; output: number; calls: number; cost: number }> = {};

    // Initialize all days
    for (let i = days - 1; i >= 0; i--) {
      const date = this.getDateOffset(i);
      dailyData[date] = { input: 0, output: 0, calls: 0, cost: 0 };
    }

    // Populate with records
    const records = this.getRecords(days);
    for (const record of records) {
      const date = record.timestamp.split('T')[0];
      if (dailyData[date]) {
        dailyData[date].input += record.inputTokens;
        dailyData[date].output += record.outputTokens;
        dailyData[date].calls += 1;
        dailyData[date].cost += this.calculateCost(record);
      }
    }

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        inputTokens: data.input,
        outputTokens: data.output,
        calls: data.calls,
        cost: Math.round(data.cost * 10000) / 10000,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Export records as JSON
   */
  exportJson(days: number = 7): string {
    const records = this.getRecords(days);
    return JSON.stringify({
      project: this.projectName,
      projectPath: this.projectPath,
      exportedAt: new Date().toISOString(),
      period: `${days} days`,
      records,
    }, null, 2);
  }

  /**
   * Export records as CSV
   */
  exportCsv(days: number = 7): string {
    const records = this.getRecords(days);
    const headers = [
      'timestamp',
      'sessionId',
      'model',
      'provider',
      'inputTokens',
      'outputTokens',
      'latencyMs',
      'costUsd',
      'skill',
      'mode',
    ];

    const lines = [headers.join(',')];
    
    for (const record of records) {
      const row = [
        record.timestamp,
        record.sessionId,
        record.model,
        record.provider,
        record.inputTokens.toString(),
        record.outputTokens.toString(),
        record.latencyMs.toString(),
        this.calculateCost(record).toFixed(6),
        record.skill || '',
        record.mode || '',
      ];
      lines.push(row.join(','));
    }

    return lines.join('\n');
  }

  /**
   * Check if tracking is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get the log directory path
   */
  getLogDir(): string {
    return this.logDir;
  }

  /**
   * Get current date string (YYYY-MM-DD)
   */
  private getDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get date string offset by N days
   */
  private getDateOffset(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }
}

// Singleton instance for global tracking
let globalTracker: TokenTracker | null = null;

export function getGlobalTracker(): TokenTracker {
  if (!globalTracker) {
    globalTracker = new TokenTracker();
  }
  return globalTracker;
}

export function createTracker(projectPath?: string): TokenTracker {
  return new TokenTracker(projectPath);
}
