/**
 * WebSocket Server - Real-time pipeline event streaming
 *
 * Features:
 * - WebSocket server with session management
 * - SSE fallback for environments without WebSocket
 * - Event buffering for reconnection
 * - OpenTelemetry-compatible tracing
 */

import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import {
  PipelineEvent,
  WSMessage,
  WSClientMessage,
} from "../types/studio.js";

interface Client {
  id: string;
  ws: WebSocket;
  sessionId?: string;
  subscribedEvents: Set<string>;
  connectedAt: number;
}

interface BufferedEvent {
  event: PipelineEvent;
  timestamp: number;
}

export class StudioWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private eventBuffer: Map<string, BufferedEvent[]> = new Map();
  private readonly MAX_BUFFER_SIZE = 1000;
  private readonly BUFFER_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private port: number = 7891) {
    this.wss = new WebSocketServer({ port });
    this.setupConnectionHandler();
    this.startBufferCleanup();
  }

  /**
   * Set up connection handler
   */
  private setupConnectionHandler(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      const clientId = randomUUID();

      const client: Client = {
        id: clientId,
        ws,
        subscribedEvents: new Set(),
        connectedAt: Date.now(),
      };

      this.clients.set(clientId, client);
      console.log(`[StudioWS] Client connected: ${clientId}`);

      ws.on("message", (data: Buffer) => {
        this.handleMessage(clientId, data);
      });

      ws.on("close", () => {
        this.handleDisconnect(clientId);
      });

      ws.on("error", (error) => {
        console.error(`[StudioWS] Client error: ${clientId}`, error);
      });

      // Send welcome message
      this.sendToClient(clientId, {
        event: "connected",
        data: { clientId, serverTime: Date.now() },
      });
    });

    this.wss.on("error", (error) => {
      console.error("[StudioWS] Server error:", error);
    });

    console.log(`[StudioWS] Server started on port ${this.port}`);
  }

  /**
   * Handle incoming client message
   */
  private handleMessage(clientId: string, data: Buffer): void {
    try {
      const message: WSClientMessage = JSON.parse(data.toString());

      const client = this.clients.get(clientId);
      if (!client) return;

      switch (message.action) {
        case "subscribe":
          this.handleSubscribe(clientId, message.sessionId);
          break;

        case "unsubscribe":
          this.handleUnsubscribe(clientId, message.sessionId);
          break;

        default:
          console.warn(`[StudioWS] Unknown action: ${(message as any).action}`);
      }
    } catch (error) {
      console.error("[StudioWS] Failed to parse message:", error);
    }
  }

  /**
   * Handle subscribe action
   */
  private handleSubscribe(clientId: string, sessionId?: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.sessionId = sessionId;

    if (sessionId) {
      // Send buffered events for this session
      const buffered = this.eventBuffer.get(sessionId) || [];
      for (const { event } of buffered) {
        this.sendToClient(clientId, {
          event: event.type,
          data: event,
        });
      }
      console.log(
        `[StudioWS] Client ${clientId} subscribed to session ${sessionId}`
      );
    }
  }

  /**
   * Handle unsubscribe action
   */
  private handleUnsubscribe(clientId: string, sessionId?: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (sessionId) {
      client.sessionId = undefined;
      console.log(
        `[StudioWS] Client ${clientId} unsubscribed from session ${sessionId}`
      );
    }
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`[StudioWS] Client disconnected: ${clientId}`);
    }
    this.clients.delete(clientId);
  }

  /**
   * Emit an event to all subscribed clients
   */
  emit(event: PipelineEvent): void {
    const sessionId = event.sessionId;

    // Buffer the event
    if (sessionId) {
      this.bufferEvent(sessionId, event);
    }

    // Send to all clients subscribed to this session
    for (const [clientId, client] of this.clients) {
      if (sessionId && client.sessionId === sessionId) {
        this.sendToClient(clientId, {
          event: event.type,
          data: event,
          metadata: {
            sessionId,
            timestamp: Date.now(),
          },
        });
      }

      // Also send to clients subscribed to all events
      if (!sessionId && client.subscribedEvents.has("*")) {
        this.sendToClient(clientId, {
          event: event.type,
          data: event,
          metadata: {
            timestamp: Date.now(),
          },
        });
      }
    }
  }

  /**
   * Send message to specific client
   */
  private sendToClient(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`[StudioWS] Failed to send to client ${clientId}:`, error);
    }
  }

  /**
   * Buffer event for reconnection
   */
  private bufferEvent(sessionId: string, event: PipelineEvent): void {
    let buffer = this.eventBuffer.get(sessionId);

    if (!buffer) {
      buffer = [];
      this.eventBuffer.set(sessionId, buffer);
    }

    buffer.push({
      event,
      timestamp: Date.now(),
    });

    // Trim buffer if too large
    if (buffer.length > this.MAX_BUFFER_SIZE) {
      buffer.shift();
    }
  }

  /**
   * Start buffer cleanup timer
   */
  private startBufferCleanup(): void {
    setInterval(() => {
      const now = Date.now();

      for (const [sessionId, buffer] of this.eventBuffer) {
        // Remove old events
        const filtered = buffer.filter(
          (e) => now - e.timestamp < this.BUFFER_TTL_MS
        );

        if (filtered.length === 0) {
          this.eventBuffer.delete(sessionId);
        } else {
          this.eventBuffer.set(sessionId, filtered);
        }
      }
    }, 60 * 1000); // Cleanup every minute
  }

  /**
   * Get server statistics
   */
  getStats(): {
    clientCount: number;
    bufferedSessions: number;
    totalBufferedEvents: number;
  } {
    return {
      clientCount: this.clients.size,
      bufferedSessions: this.eventBuffer.size,
      totalBufferedEvents: Array.from(this.eventBuffer.values()).reduce(
        (sum, buffer) => sum + buffer.length,
        0
      ),
    };
  }

  /**
   * Broadcast to all clients
   */
  broadcast(message: WSMessage): void {
    for (const clientId of this.clients.keys()) {
      this.sendToClient(clientId, message);
    }
  }

  /**
   * Gracefully shutdown
   */
  async shutdown(): Promise<void> {
    console.log("[StudioWS] Shutting down...");

    // Close all client connections
    for (const [clientId, client] of this.clients) {
      client.ws.close(1001, "Server shutting down");
    }

    // Close server
    return new Promise((resolve) => {
      this.wss.close(() => {
        console.log("[StudioWS] Server closed");
        resolve();
      });
    });
  }
}

// Singleton instance
let wsServerInstance: StudioWebSocketServer | null = null;

export function getWebSocketServer(port?: number): StudioWebSocketServer {
  if (!wsServerInstance) {
    wsServerInstance = new StudioWebSocketServer(port);
  }
  return wsServerInstance;
}

export function createWebSocketServer(port?: number): StudioWebSocketServer {
  return new StudioWebSocketServer(port);
}
