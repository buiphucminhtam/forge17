/**
 * StatsPanel - Token/Cost/Performance statistics
 *
 * Features:
 * - Token usage tracking
 * - Cost estimation
 * - Session duration
 * - Error rate
 */

import React from "react";
import { SessionMetrics } from "../../types/studio.js";
import { formatTokens, formatCost } from "../../hooks/useTokenTracker.js";

interface StatsPanelProps {
  metrics: SessionMetrics;
  isRunning: boolean;
}

export function StatsPanel({ metrics, isRunning }: StatsPanelProps) {
  const stats = [
    {
      label: "Tokens",
      value: formatTokens(metrics.tokens),
      icon: "💬",
      color: "blue",
    },
    {
      label: "Cost",
      value: formatCost(metrics.cost),
      icon: "💰",
      color: "green",
    },
    {
      label: "Duration",
      value: formatDuration(metrics.duration),
      icon: "⏱️",
      color: "purple",
    },
    {
      label: "Skills",
      value: metrics.skillCount.toString(),
      icon: "⚙️",
      color: "orange",
    },
    {
      label: "Errors",
      value: metrics.errorCount.toString(),
      icon: "⚠️",
      color: metrics.errorCount > 0 ? "red" : "gray",
    },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Session Stats</h2>
        {isRunning && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-lg p-3`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{stat.icon}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <div className={`text-xl font-bold text-${stat.color}-700`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Cost Breakdown */}
      {metrics.cost > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Cost Estimate</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>GPT-4o Prompt:</span>
              <span className="font-mono">
                ${(metrics.tokens * 0.5 * 2.5 / 1_000_000).toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GPT-4o Completion:</span>
              <span className="font-mono">
                ${(metrics.tokens * 0.5 * 10.0 / 1_000_000).toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1 font-medium">
              <span>Total:</span>
              <span className="font-mono">{formatCost(metrics.cost)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {metrics.skillCount > 5 && metrics.errorCount === 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-xs text-green-700">
            Great progress! {metrics.skillCount} skills completed with no errors.
          </p>
        </div>
      )}

      {metrics.errorCount > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-xs text-red-700">
            {metrics.errorCount} error{metrics.errorCount > 1 ? "s" : ""} occurred.
            Check the Memory Trace for details.
          </p>
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}
