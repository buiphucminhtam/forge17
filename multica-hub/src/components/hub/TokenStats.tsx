'use client';

import { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  Clock,
  DollarSign,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenUsage {
  total_tokens: number;
  total_cost_usd: number;
  total_calls: number;
  avg_latency_ms: number;
  input_tokens: number;
  output_tokens: number;
}

interface TokenStatsData {
  summary?: TokenUsage;
  by_model?: Record<string, { tokens: number; cost: number; provider: string }>;
  by_provider?: Record<string, { cost: number; calls: number }>;
}

export function TokenStats() {
  const [data, setData] = useState<TokenStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<number>(7);

  const fetchTokenData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch from token API server
      const res = await fetch(`http://localhost:8895/api/usage?project=all&period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else if (res.status === 404) {
        // API not running, use demo data
        setData(getDemoData());
        setError('Token API not running. Showing demo data.');
      } else {
        setData(getDemoData());
      }
    } catch {
      // API not available, show demo data
      setData(getDemoData());
      setError('Token API not available. Showing demo data.');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTokenData();
    const interval = setInterval(fetchTokenData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [period]);

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const summary = data?.summary;

  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-accent-primary" />
          <h3 className="font-medium text-text-primary">Token Usage</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex gap-1 p-1 bg-bg-secondary rounded-lg">
            {[1, 7, 30].map((days) => (
              <button
                key={days}
                onClick={() => setPeriod(days)}
                className={cn(
                  'px-2 py-1 text-xs rounded-md transition-colors',
                  period === days
                    ? 'bg-bg-card text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {days === 1 ? 'Today' : days === 7 ? '7D' : '30D'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchTokenData}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-2 bg-status-busy/10 rounded-lg border border-status-busy/20">
          <div className="flex items-center gap-2 text-xs text-status-busy">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
          <div className="mt-2 text-xs text-text-muted">
            Run <code className="px-1 py-0.5 bg-bg-secondary rounded">python3 scripts/token-api-server.py</code> to enable live tracking
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-bg-secondary rounded-lg border border-border text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coins className="h-3 w-3 text-accent-primary" />
          </div>
          <div className="text-lg font-semibold text-accent-primary">
            {summary ? formatNumber(summary.total_tokens) : '-'}
          </div>
          <div className="text-xs text-text-muted">Total Tokens</div>
        </div>

        <div className="p-3 bg-bg-secondary rounded-lg border border-border text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="h-3 w-3 text-tertiary" />
          </div>
          <div className="text-lg font-semibold text-tertiary">
            {summary ? `$${summary.total_cost_usd.toFixed(2)}` : '-'}
          </div>
          <div className="text-xs text-text-muted">Total Cost</div>
        </div>

        <div className="p-3 bg-bg-secondary rounded-lg border border-border text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="h-3 w-3 text-secondary" />
          </div>
          <div className="text-lg font-semibold text-secondary">
            {summary ? formatNumber(summary.total_calls) : '-'}
          </div>
          <div className="text-xs text-text-muted">LLM Calls</div>
        </div>

        <div className="p-3 bg-bg-secondary rounded-lg border border-border text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-3 w-3 text-status-online" />
          </div>
          <div className="text-lg font-semibold text-status-online">
            {summary ? `${Math.round(summary.avg_latency_ms)}ms` : '-'}
          </div>
          <div className="text-xs text-text-muted">Avg Latency</div>
        </div>
      </div>

      {/* Token Breakdown */}
      {summary && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Input / Output Ratio</span>
            <span className="text-text-primary font-medium">
              {formatNumber(summary.input_tokens)} / {formatNumber(summary.output_tokens)}
            </span>
          </div>
          <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-primary rounded-full transition-all"
              style={{
                width: `${(summary.input_tokens / summary.total_tokens) * 100}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Input ({Math.round((summary.input_tokens / summary.total_tokens) * 100)}%)</span>
            <span>Output ({Math.round((summary.output_tokens / summary.total_tokens) * 100)}%)</span>
          </div>
        </div>
      )}

      {/* Top Models */}
      {data?.by_model && Object.keys(data.by_model).length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Top Models
          </h4>
          <div className="space-y-2">
            {Object.entries(data.by_model)
              .slice(0, 5)
              .map(([name, info]) => (
                <div
                  key={name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        info.provider === 'anthropic' && 'bg-orange-500',
                        info.provider === 'openai' && 'bg-green-600',
                        info.provider === 'google' && 'bg-blue-500'
                      )}
                    />
                    <span className="text-text-primary truncate max-w-[150px]">
                      {name.split('-').slice(0, 3).join('-')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>{formatNumber(info.tokens)} tokens</span>
                    <span className="font-medium text-text-secondary">
                      ${info.cost.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* External Dashboard Link */}
      <div className="mt-4 pt-4 border-t border-border">
        <a
          href="http://localhost:8895/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full p-2 bg-bg-secondary rounded-lg hover:bg-bg-hover transition-colors text-sm text-text-secondary hover:text-text-primary"
        >
          <span>Open Full Dashboard</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// Demo data when API is not available
function getDemoData(): TokenStatsData {
  return {
    summary: {
      total_tokens: 1250000,
      total_cost_usd: 12.45,
      total_calls: 245,
      avg_latency_ms: 850,
      input_tokens: 950000,
      output_tokens: 300000,
    },
    by_model: {
      'claude-3-5-sonnet': { tokens: 850000, cost: 8.50, provider: 'anthropic' },
      'claude-3-haiku': { tokens: 250000, cost: 0.25, provider: 'anthropic' },
      'gpt-4o': { tokens: 100000, cost: 3.00, provider: 'openai' },
      'gpt-4o-mini': { tokens: 50000, cost: 0.20, provider: 'openai' },
    },
    by_provider: {
      anthropic: { cost: 8.75, calls: 180 },
      openai: { cost: 3.20, calls: 65 },
    },
  };
}
