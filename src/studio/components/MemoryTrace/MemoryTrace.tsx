/**
 * MemoryTrace - Displays memory trace timeline
 *
 * Features:
 * - Chronological event display
 * - Filtering by action type
 * - Auto-scroll with pause on hover
 * - Collapsible entries
 */

import React, { useState, useEffect, useRef } from "react";
import { MemoryTraceEvent } from "../../types/studio.js";

interface MemoryTraceProps {
  events: MemoryTraceEvent[];
  maxEvents?: number;
}

const ACTION_ICONS: Record<string, string> = {
  memory: "🧠",
  skill: "⚙️",
  tool: "🔧",
  file: "📄",
  network: "🌐",
  error: "⚠️",
  default: "📌",
};

function getIcon(action: string): string {
  const lower = action.toLowerCase();
  for (const [key, icon] of Object.entries(ACTION_ICONS)) {
    if (lower.includes(key)) {
      return icon;
    }
  }
  return ACTION_ICONS.default;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(timestamp: number, baseTimestamp: number): string {
  const diff = timestamp - baseTimestamp;
  if (diff < 1000) return `${diff}ms`;
  if (diff < 60000) return `${(diff / 1000).toFixed(1)}s`;
  return `${(diff / 60000).toFixed(1)}m`;
}

export function MemoryTrace({ events, maxEvents = 100 }: MemoryTraceProps) {
  const [filter, setFilter] = useState<string>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.action.toLowerCase().includes(filter.toLowerCase());
  });

  const displayedEvents = filteredEvents.slice(-maxEvents);

  const baseTimestamp = displayedEvents[0]?.timestamp || Date.now();

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && !isHoveringRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedEvents, autoScroll]);

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const actionTypes = Array.from(
    new Set(events.map((e) => e.action.split(":")[0]))
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Memory Trace</h3>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1"
          >
            <option value="all">All</option>
            {actionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs px-2 py-1 rounded border ${
              autoScroll
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            {autoScroll ? "Auto" : "Pause"}
          </button>
        </div>
      </div>

      {/* Event List */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex-1 overflow-y-auto p-2 space-y-1"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        {displayedEvents.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-2xl mb-2">📜</div>
            <p className="text-sm">No memory traces yet</p>
          </div>
        ) : (
          displayedEvents.map((event, index) => (
            <div
              key={`${event.timestamp}-${index}`}
              className="flex items-start gap-2 text-xs hover:bg-gray-50 rounded px-2 py-1 transition-colors"
            >
              <span className="text-gray-400 w-16 flex-shrink-0">
                {formatTime(event.timestamp)}
              </span>

              <span className="text-gray-300 w-8 flex-shrink-0">
                +{formatDuration(event.timestamp, baseTimestamp)}
              </span>

              <span className="flex-shrink-0">{getIcon(event.action)}</span>

              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-700">
                  {event.action}
                </span>
                <span className="text-gray-500 ml-2 truncate">
                  {event.detail}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-100 text-xs text-gray-400 text-center">
        {displayedEvents.length} events
        {filter !== "all" && ` (filtered from ${events.length})`}
      </div>
    </div>
  );
}
