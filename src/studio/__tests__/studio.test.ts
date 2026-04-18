/**
 * Studio Tests - Unit tests for Studio module
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { StudioWebSocketServer } from "../server/wsServer";
import { StudioEventEmitter } from "../server/eventEmitter";

describe("StudioWebSocketServer", () => {
  let server: StudioWebSocketServer;

  afterEach(async () => {
    if (server) {
      await server.shutdown();
    }
  });

  describe("creation", () => {
    it("should create server on specified port", () => {
      server = new StudioWebSocketServer(7892);
      const stats = server.getStats();
      expect(stats.clientCount).toBe(0);
    });
  });

  describe("getStats()", () => {
    it("should return initial stats", () => {
      server = new StudioWebSocketServer(7893);
      const stats = server.getStats();

      expect(stats.clientCount).toBe(0);
      expect(stats.bufferedSessions).toBe(0);
      expect(stats.totalBufferedEvents).toBe(0);
    });
  });
});

describe("StudioEventEmitter", () => {
  let emitter: StudioEventEmitter;

  beforeEach(() => {
    emitter = StudioEventEmitter.getInstance();
    emitter.destroy();
    emitter = StudioEventEmitter.getInstance();
  });

  afterEach(() => {
    emitter.destroy();
  });

  describe("singleton", () => {
    it("should return same instance", () => {
      const instance1 = StudioEventEmitter.getInstance();
      const instance2 = StudioEventEmitter.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("session management", () => {
    it("should start new session", () => {
      const sessionId = emitter.startSession("build");
      expect(sessionId).toBeDefined();
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it("should return null for no active session", () => {
      expect(emitter.getCurrentSession()).toBeNull();
    });

    it("should return session id after starting", () => {
      const sessionId = emitter.startSession("build");
      expect(emitter.getCurrentSession()).toBe(sessionId);
    });
  });

  describe("event emission", () => {
    it("should emit progress event", () => {
      emitter.startSession("build");

      // Should not throw
      expect(() => {
        emitter.progress("define", "architect", "running", 50, "Analyzing requirements");
      }).not.toThrow();
    });

    it("should emit skill event", () => {
      emitter.startSession("build");

      expect(() => {
        emitter.skill("architect", "running", 50);
      }).not.toThrow();
    });

    it("should emit trace event", () => {
      emitter.startSession("build");

      expect(() => {
        emitter.trace("memory:read", "Loaded project context");
      }).not.toThrow();
    });

    it("should emit error event", () => {
      emitter.startSession("build");

      expect(() => {
        emitter.error("Something went wrong", false);
      }).not.toThrow();
    });

    it("should emit stats event", () => {
      emitter.startSession("build");

      expect(() => {
        emitter.stats(1000, 0.05, 5000);
      }).not.toThrow();
    });

    it("should complete session", () => {
      emitter.startSession("build");

      expect(() => {
        emitter.complete(9.5);
      }).not.toThrow();

      expect(emitter.getCurrentSession()).toBeNull();
    });
  });

  describe("subscription", () => {
    it("should subscribe to events", () => {
      const received: any[] = [];

      const unsubscribe = emitter.on("pipeline:start", (event) => {
        received.push(event);
      });

      emitter.startSession("build");

      expect(received.length).toBe(1);
      expect(received[0].type).toBe("pipeline:start");

      unsubscribe();
    });

    it("should subscribe to all events", () => {
      const received: any[] = [];

      const unsubscribe = emitter.onAny((event) => {
        received.push(event);
      });

      emitter.startSession("build");
      emitter.progress("define", "architect", "running", 50);

      expect(received.length).toBe(2);

      unsubscribe();
    });

    it("should unsubscribe", () => {
      const received: any[] = [];

      const unsubscribe = emitter.on("pipeline:start", (event) => {
        received.push(event);
      });

      unsubscribe();
      emitter.startSession("build");

      expect(received.length).toBe(0);
    });
  });

  describe("buffering", () => {
    it("should buffer events", () => {
      emitter.startSession("build");
      emitter.progress("define", "architect", "running", 50);

      const buffer = emitter.getBuffer();
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should clear buffer", () => {
      emitter.startSession("build");
      emitter.progress("define", "architect", "running", 50);

      emitter.clearBuffer();

      const buffer = emitter.getBuffer();
      expect(buffer.length).toBe(0);
    });
  });

  describe("WebSocket integration", () => {
    it("should set WebSocket server", () => {
      const mockServer = {
        emit: () => {},
      };

      expect(() => {
        emitter.setWebSocketServer(mockServer);
      }).not.toThrow();
    });
  });

  describe("destroy", () => {
    it("should clean up on destroy", () => {
      emitter.startSession("build");
      emitter.destroy();

      expect(emitter.getCurrentSession()).toBeNull();
      expect(emitter.getBuffer()).toEqual([]);
    });
  });
});
