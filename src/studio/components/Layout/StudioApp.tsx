/**
 * StudioApp - Main Forgewright Studio application
 *
 * Features:
 * - Real-time pipeline monitoring
 * - Memory trace timeline
 * - Token/Cost tracking
 * - Session history
 */

import React, { useState } from "react";
import { PipelineMonitor } from "./PipelineMonitor/PipelineMonitor";
import { MemoryTrace } from "./MemoryTrace/MemoryTrace";
import { StatsPanel } from "./StatsPanel/StatsPanel";
import { usePipeline } from "../hooks/usePipeline";
import { MemoryTraceEvent } from "../types/studio.js";

interface StudioAppProps {
  sessionId?: string;
  wsUrl?: string;
}

type TabType = "pipeline" | "memory" | "stats";

export function StudioApp({ sessionId, wsUrl = "ws://localhost:7891" }: StudioAppProps) {
  const [activeTab, setActiveTab] = useState<TabType>("pipeline");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    session,
    phases,
    events,
    metrics,
    isConnected,
    isRunning,
    connect,
    disconnect,
  } = usePipeline({ sessionId, wsUrl, autoConnect: true });

  // Filter memory trace events
  const memoryEvents: MemoryTraceEvent[] = events.filter(
    (e) => e.type === "memory:trace"
  ) as MemoryTraceEvent[];

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "pipeline", label: "Pipeline", icon: "📊" },
    { id: "memory", label: "Memory", icon: "🧠" },
    { id: "stats", label: "Stats", icon: "📈" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              FW
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-gray-800">Studio</h1>
                <p className="text-xs text-gray-400">Forgewright</p>
              </div>
            )}
          </div>
        </div>

        {/* Session Info */}
        {!sidebarCollapsed && session && (
          <div className="p-4 border-b border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Current Session</div>
            <div className="font-mono text-sm text-gray-700 truncate">
              {session.id.slice(0, 8)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Mode: {session.mode}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{tab.icon}</span>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{tab.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-4 border-t border-gray-100 text-gray-400 hover:text-gray-600 text-center"
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="text-xs text-gray-500">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {/* Session Status */}
            {session && (
              <span
                className={`text-xs px-2 py-1 rounded ${
                  isRunning
                    ? "bg-blue-100 text-blue-700"
                    : session.status === "complete"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {isRunning
                  ? "Running"
                  : session.status === "complete"
                    ? "Complete"
                    : "Error"}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isConnected ? (
              <button
                onClick={connect}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
              >
                Connect
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
              >
                Disconnect
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "pipeline" && (
            <div className="h-full overflow-y-auto">
              <PipelineMonitor phases={phases} isRunning={isRunning} />
            </div>
          )}

          {activeTab === "memory" && (
            <div className="h-full">
              <MemoryTrace events={memoryEvents} />
            </div>
          )}

          {activeTab === "stats" && (
            <div className="h-full overflow-y-auto">
              <StatsPanel metrics={metrics} isRunning={isRunning} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
