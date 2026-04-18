/**
 * Studio Event Emitter - Centralized pipeline event emission
 *
 * Features:
 * - Singleton pattern for global access
 * - Event buffering and batching
 * - Memory leak prevention
 * - Integration with WebSocket server
 */

import { randomUUID } from "crypto";
import {
  PipelineEvent,
  PipelineStartEvent,
  PipelineProgressEvent,
  PipelineCompleteEvent,
  SkillEvent,
  MemoryTraceEvent,
  ErrorEvent,
  StatsEvent,
} from "../types/studio.js";

type EventHandler = (event: PipelineEvent) => void;

export class StudioEventEmitter {
  private static instance: StudioEventEmitter | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private buffer: PipelineEvent[] = [];
  private readonly MAX_BUFFER_SIZE = 100;
  private flushInterval: NodeJS.Timeout | null = null;
  private wsServer: any = null;
  private sessionId: string | null = null;

  private constructor() {
    this.startFlushInterval();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): StudioEventEmitter {
    if (!StudioEventEmitter.instance) {
      StudioEventEmitter.instance = new StudioEventEmitter();
    }
    return StudioEventEmitter.instance;
  }

  /**
   * Set WebSocket server for real-time streaming
   */
  setWebSocketServer(server: any): void {
    this.wsServer = server;
  }

  /**
   * Start a new session
   */
  startSession(mode: string): string {
    this.sessionId = randomUUID();

    const event: PipelineStartEvent = {
      type: "pipeline:start",
      sessionId: this.sessionId,
      mode,
      timestamp: Date.now(),
    };

    this.emit(event);
    return this.sessionId;
  }

  /**
   * Emit pipeline progress
   */
  progress(
    phase: string,
    skill: string,
    status: "running" | "complete" | "error",
    progress: number,
    message?: string
  ): void {
    if (!this.sessionId) {
      console.warn("[StudioEventEmitter] No active session");
      return;
    }

    const event: PipelineProgressEvent = {
      type: "pipeline:progress",
      sessionId: this.sessionId,
      phase,
      skill,
      status,
      progress,
      message,
      timestamp: Date.now(),
    };

    this.emit(event);
  }

  /**
   * Emit skill event
   */
  skill(
    name: string,
    status: "running" | "complete" | "error",
    progress: number,
    message?: string
  ): void {
    if (!this.sessionId) return;

    const event: SkillEvent = {
      type: `skill:${status === "running" ? "start" : status === "complete" ? "complete" : "error"}` as any,
      sessionId: this.sessionId,
      skill: name,
      status,
      progress,
      message,
      timestamp: Date.now(),
    };

    this.emit(event);
  }

  /**
   * Emit memory trace
   */
  trace(action: string, detail: string): void {
    if (!this.sessionId) return;

    const event: MemoryTraceEvent = {
      type: "memory:trace",
      sessionId: this.sessionId,
      action,
      detail,
      timestamp: Date.now(),
    };

    this.emit(event);
  }

  /**
   * Emit error
   */
  error(error: Error | string, isThrow: boolean = false): void {
    if (!this.sessionId) return;

    const event: ErrorEvent = {
      type: isThrow ? "error:throw" : "error:log",
      sessionId: this.sessionId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
    };

    this.emit(event);
  }

  /**
   * Emit stats update
   */
  stats(tokens: number, cost: number, duration: number): void {
    if (!this.sessionId) return;

    const event: StatsEvent = {
      type: "stats:update",
      sessionId: this.sessionId,
      tokens,
      cost,
      duration,
      timestamp: Date.now(),
    };

    this.emit(event);
  }

  /**
   * Complete the session
   */
  complete(score?: number): void {
    if (!this.sessionId) return;

    const event: PipelineCompleteEvent = {
      type: "pipeline:complete",
      sessionId: this.sessionId,
      duration: Date.now(),
      score,
      timestamp: Date.now(),
    };

    this.emit(event);
    this.sessionId = null;
  }

  /**
   * Subscribe to events
   */
  on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: EventHandler): () => void {
    return this.on("*", handler);
  }

  /**
   * Emit an event
   */
  private emit(event: PipelineEvent): void {
    // Add to buffer
    this.buffer.push(event);

    // Trim buffer if too large
    if (this.buffer.length > this.MAX_BUFFER_SIZE) {
      this.buffer.shift();
    }

    // Notify handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (error) {
          console.error("[StudioEventEmitter] Handler error:", error);
        }
      }
    }

    // Also notify wildcard handlers
    const wildcardHandlers = this.handlers.get("*");
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        try {
          handler(event);
        } catch (error) {
          console.error("[StudioEventEmitter] Wildcard handler error:", error);
        }
      }
    }

    // Send to WebSocket server
    if (this.wsServer) {
      this.wsServer.emit(event);
    }
  }

  /**
   * Start flush interval for batching
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      // Could batch events here if needed
    }, 1000);
  }

  /**
   * Get buffered events
   */
  getBuffer(): PipelineEvent[] {
    return [...this.buffer];
  }

  /**
   * Clear buffer
   */
  clearBuffer(): void {
    this.buffer = [];
  }

  /**
   * Get current session ID
   */
  getCurrentSession(): string | null {
    return this.sessionId;
  }

  /**
   * Clean up (call on shutdown)
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.handlers.clear();
    this.buffer = [];
    this.sessionId = null;
    this.wsServer = null;
    StudioEventEmitter.instance = null;
  }
}

// Factory function
export function getStudioEventEmitter(): StudioEventEmitter {
  return StudioEventEmitter.getInstance();
}

export function createStudioEventEmitter(): StudioEventEmitter {
  return StudioEventEmitter.getInstance();
}
