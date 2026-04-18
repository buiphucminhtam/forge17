/**
 * Studio Module - Forgewright real-time pipeline monitoring
 *
 * Based on AgentScope Studio patterns
 * https://github.com/agentscope-ai/agentscope-studio
 *
 * Features:
 * - WebSocket server for real-time event streaming
 * - Pipeline event emitter with session management
 * - React hooks for UI integration
 * - OpenTelemetry-compatible tracing
 */

// Types
export * from "./types/studio.js";

// Server
export { StudioWebSocketServer, getWebSocketServer, createWebSocketServer } from "./server/wsServer.js";
export { StudioEventEmitter, getStudioEventEmitter, createStudioEventEmitter } from "./server/eventEmitter.js";

// React hooks
export { usePipeline } from "./hooks/usePipeline.js";
export { useTokenTracker, formatCost, formatTokens } from "./hooks/useTokenTracker.js";
