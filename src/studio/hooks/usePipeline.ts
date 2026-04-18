/**
 * usePipeline - React hook for pipeline state management
 *
 * Features:
 * - Real-time event subscription via WebSocket/SSE
 * - Session state management
 * - Memory trace history
 * - Token/cost tracking
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  PipelineEvent,
  Session,
  SessionMetrics,
  Phase,
  Skill,
} from "../types/studio.js";

interface UsePipelineOptions {
  sessionId?: string;
  wsUrl?: string;
  autoConnect?: boolean;
}

interface UsePipelineReturn {
  session: Session | null;
  phases: Phase[];
  events: PipelineEvent[];
  metrics: SessionMetrics;
  isConnected: boolean;
  isRunning: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribe: (sessionId: string) => void;
}

export function usePipeline(options: UsePipelineOptions = {}): UsePipelineReturn {
  const {
    sessionId: initialSessionId,
    wsUrl = "ws://localhost:7891",
    autoConnect = true,
  } = options;

  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [metrics, setMetrics] = useState<SessionMetrics>({
    tokens: 0,
    cost: 0,
    duration: 0,
    skillCount: 0,
    errorCount: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Process incoming event
  const processEvent = useCallback((event: PipelineEvent) => {
    setEvents((prev) => [...prev.slice(-99), event]);

    switch (event.type) {
      case "pipeline:start":
        setSession({
          id: event.sessionId,
          mode: event.mode,
          startTime: event.timestamp,
          status: "running",
          progress: 0,
          events: [],
          metrics: {
            tokens: 0,
            cost: 0,
            duration: 0,
            skillCount: 0,
            errorCount: 0,
          },
        });
        setIsRunning(true);
        setPhases([]);
        break;

      case "pipeline:progress":
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentPhase: event.phase,
            currentSkill: event.skill,
            progress: event.progress,
            status: event.status === "error" ? "error" : "running",
          };
        });

        // Update or create phase
        setPhases((prev) => {
          const existing = prev.find((p) => p.name === event.phase);
          if (existing) {
            return prev.map((p) =>
              p.name === event.phase
                ? {
                    ...p,
                    status:
                      event.status === "error"
                        ? "error"
                        : event.status === "complete"
                          ? "complete"
                          : p.status,
                    progress: event.progress,
                  }
                : p
            );
          } else {
            return [
              ...prev,
              {
                id: event.phase.toLowerCase().replace(/\s+/g, "-"),
                name: event.phase,
                status:
                  event.status === "error"
                    ? "error"
                    : event.status === "complete"
                      ? "complete"
                      : "running",
                progress: event.progress,
                skills: [],
              },
            ];
          }
        });
        break;

      case "pipeline:complete":
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: "complete",
            endTime: event.timestamp,
            progress: 100,
          };
        });
        setIsRunning(false);
        break;

      case "stats:update":
        setMetrics((prev) => ({
          ...prev,
          tokens: event.tokens,
          cost: event.cost,
          duration: event.duration,
        }));
        break;

      case "error:throw":
      case "error:log":
        setMetrics((prev) => ({
          ...prev,
          errorCount: prev.errorCount + 1,
        }));
        break;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[usePipeline] Connected to WebSocket");
        setIsConnected(true);

        // Subscribe to session if provided
        if (initialSessionId) {
          ws.send(
            JSON.stringify({
              action: "subscribe",
              sessionId: initialSessionId,
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.data) {
            processEvent(message.data);
          }
        } catch (error) {
          console.error("[usePipeline] Failed to parse message:", error);
        }
      };

      ws.onclose = () => {
        console.log("[usePipeline] WebSocket closed");
        setIsConnected(false);

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("[usePipeline] WebSocket error:", error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[usePipeline] Failed to connect:", error);
    }
  }, [wsUrl, initialSessionId, processEvent]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Subscribe to specific session
  const subscribe = useCallback((newSessionId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: "subscribe",
          sessionId: newSessionId,
        })
      );
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, []);

  // Calculate duration from session
  const currentSession = session
    ? {
        ...session,
        metrics: {
          ...session.metrics,
          duration: session.endTime
            ? session.endTime - session.startTime
            : Date.now() - session.startTime,
        },
      }
    : null;

  return {
    session: currentSession,
    phases,
    events,
    metrics: session?.metrics || metrics,
    isConnected,
    isRunning,
    connect,
    disconnect,
    subscribe,
  };
}
