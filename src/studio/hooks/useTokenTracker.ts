/**
 * useTokenTracker - React hook for tracking token usage and cost
 *
 * Features:
 * - Real-time token counting
 * - Cost estimation
 * - Token history per skill/mode
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  cost: number;
}

interface UseTokenTrackerReturn {
  usage: TokenUsage;
  history: Array<{
    timestamp: number;
    tokens: number;
    cost: number;
    skill?: string;
  }>;
  estimateCost: (tokens: number) => number;
  addUsage: (
    tokens: number,
    options?: { skill?: string; isPrompt?: boolean }
  ) => void;
  reset: () => void;
}

// Pricing per 1M tokens (OpenAI GPT-4o as default)
const DEFAULT_PRICING = {
  prompt: 2.5, // $2.50 per 1M tokens
  completion: 10.0, // $10.00 per 1M tokens
};

export function useTokenTracker(
  pricing: Partial<typeof DEFAULT_PRICING> = DEFAULT_PRICING
): UseTokenTrackerReturn {
  const effectivePricing = { ...DEFAULT_PRICING, ...pricing };

  const [usage, setUsage] = useState<TokenUsage>({
    prompt: 0,
    completion: 0,
    total: 0,
    cost: 0,
  });

  const [history, setHistory] = useState<
    Array<{
      timestamp: number;
      tokens: number;
      cost: number;
      skill?: string;
    }>
  >([]);

  const historyRef = useRef(history);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const estimateCost = useCallback(
    (tokens: number): number => {
      // Assume 50/50 split between prompt and completion
      const promptTokens = Math.floor(tokens * 0.5);
      const completionTokens = tokens - promptTokens;

      return (
        (promptTokens / 1_000_000) * effectivePricing.prompt +
        (completionTokens / 1_000_000) * effectivePricing.completion
      );
    },
    [effectivePricing]
  );

  const addUsage = useCallback(
    (
      tokens: number,
      options: { skill?: string; isPrompt?: boolean } = {}
    ) => {
      const cost = estimateCost(tokens);

      setUsage((prev) => {
        const newUsage = { ...prev };

        if (options.isPrompt) {
          newUsage.prompt += tokens;
        } else {
          newUsage.completion += tokens;
        }

        newUsage.total = newUsage.prompt + newUsage.completion;
        newUsage.cost += cost;

        return newUsage;
      });

      setHistory((prev) => [
        ...prev.slice(-499), // Keep last 500 entries
        {
          timestamp: Date.now(),
          tokens,
          cost,
          skill: options.skill,
        },
      ]);
    },
    [estimateCost]
  );

  const reset = useCallback(() => {
    setUsage({
      prompt: 0,
      completion: 0,
      total: 0,
      cost: 0,
    });
    setHistory([]);
  }, []);

  return {
    usage,
    history,
    estimateCost,
    addUsage,
    reset,
  };
}

// Format cost for display
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(2)}k`;
  }
  return `$${cost.toFixed(4)}`;
}

// Format tokens for display
export function formatTokens(tokens: number): string {
  if (tokens < 1000) {
    return tokens.toString();
  }
  if (tokens < 1_000_000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return `${(tokens / 1_000_000).toFixed(2)}M`;
}
