/**
 * Studio Types - TypeScript interfaces for Forgewright Studio
 *
 * Based on AgentScope Studio patterns
 * https://github.com/agentscope-ai/agentscope-studio
 */

import { z } from "zod";

// =============================================================================
// Pipeline Events
// =============================================================================

export const PipelineEventType = z.enum([
  "pipeline:start",
  "pipeline:progress",
  "pipeline:complete",
  "pipeline:error",
  "skill:start",
  "skill:progress",
  "skill:complete",
  "skill:error",
  "memory:trace",
  "error:throw",
  "error:log",
  "stats:update",
]);
export type PipelineEventType = z.infer<typeof PipelineEventType>;

export interface PipelineStartEvent {
  type: "pipeline:start";
  sessionId: string;
  mode: string;
  timestamp: number;
}

export interface PipelineProgressEvent {
  type: "pipeline:progress";
  sessionId: string;
  phase: string;
  skill: string;
  status: "running" | "complete" | "error";
  progress: number;
  message?: string;
  timestamp: number;
}

export interface PipelineCompleteEvent {
  type: "pipeline:complete";
  sessionId: string;
  duration: number;
  score?: number;
  timestamp: number;
}

export interface SkillEvent {
  type: "skill:start" | "skill:progress" | "skill:complete" | "skill:error";
  sessionId: string;
  skill: string;
  status: "running" | "complete" | "error";
  progress: number;
  message?: string;
  timestamp: number;
}

export interface MemoryTraceEvent {
  type: "memory:trace";
  sessionId: string;
  action: string;
  detail: string;
  timestamp: number;
}

export interface ErrorEvent {
  type: "error:throw" | "error:log";
  sessionId: string;
  error: string;
  stack?: string;
  timestamp: number;
}

export interface StatsEvent {
  type: "stats:update";
  sessionId: string;
  tokens: number;
  cost: number;
  duration: number;
  timestamp: number;
}

export type PipelineEvent =
  | PipelineStartEvent
  | PipelineProgressEvent
  | PipelineCompleteEvent
  | SkillEvent
  | MemoryTraceEvent
  | ErrorEvent
  | StatsEvent;

// =============================================================================
// Session State
// =============================================================================

export interface Session {
  id: string;
  mode: string;
  startTime: number;
  endTime?: number;
  status: "running" | "complete" | "error";
  currentPhase?: string;
  currentSkill?: string;
  progress: number;
  events: PipelineEvent[];
  metrics: SessionMetrics;
}

export interface SessionMetrics {
  tokens: number;
  cost: number;
  duration: number;
  skillCount: number;
  errorCount: number;
}

// =============================================================================
// UI State
// =============================================================================

export interface UIState {
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  selectedSessionId?: string;
  expandedPhases: string[];
  expandedSkills: string[];
}

// =============================================================================
// Golden Signals (per OpenObserve/Liveblocks patterns)
// =============================================================================

export interface GoldenSignals {
  requestRate: number;
  errorRate: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  saturation: number;
}

// =============================================================================
// Pipeline Phase
// =============================================================================

export interface Phase {
  id: string;
  name: string;
  status: "pending" | "running" | "complete" | "error";
  progress: number;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  status: "pending" | "running" | "complete" | "error";
  progress: number;
  message?: string;
  startTime?: number;
  endTime?: number;
}

// =============================================================================
// WebSocket Messages
// =============================================================================

export interface WSMessage {
  event: string;
  data: PipelineEvent;
  metadata?: {
    sessionId: string;
    timestamp: number;
  };
}

export interface WSClientMessage {
  action: "subscribe" | "unsubscribe";
  sessionId?: string;
}

// =============================================================================
// Studio Configuration
// =============================================================================

export const StudioConfigSchema = z.object({
  enabled: z.boolean().default(false),
  port: z.number().default(7890),
  wsPort: z.number().default(7891),
  autoStart: z.boolean().default(false),
  theme: z.enum(["light", "dark", "system"]).default("system"),
});
export type StudioConfig = z.infer<typeof StudioConfigSchema>;

// =============================================================================
// Friday Agent (AgentScope Studio pattern)
// =============================================================================

export interface FridayConfig {
  enabled: boolean;
  capabilities: {
    metaTool: boolean;
    agentHook: boolean;
    agentInterruption: boolean;
    truncatedPrompt: boolean;
    stateManagement: boolean;
  };
}

export interface AgentState {
  isRunning: boolean;
  isPaused: boolean;
  memory: Record<string, unknown>;
  currentSkill?: string;
}

// =============================================================================
// OpenTelemetry Integration
// =============================================================================

export const OpenTelemetrySpanType = z.enum([
  "ai.model.invocation",
  "ai.agent.turn",
  "ai.tool.execution",
  "ai.token.usage",
  "ai.error",
]);
export type OpenTelemetrySpanType = z.infer<typeof OpenTelemetrySpanType>;

export interface OTelSpan {
  traceId: string;
  spanId: string;
  spanName: string;
  spanType: OpenTelemetrySpanType;
  startTime: number;
  endTime?: number;
  attributes: Record<string, unknown>;
}
