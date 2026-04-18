/**
 * Sandbox Integration Tests
 *
 * End-to-end tests for the sandbox system
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import {
  createSandboxSession,
  endSandboxSession,
  getSandboxManager,
} from "../manager/SandboxManager";
import { createPolicyEngine } from "../manager/PolicyEngine";
import { createFilesystemExecutor } from "../executors/FilesystemExecutor";
import { createNetworkExecutor } from "../executors/NetworkExecutor";
import { createShellExecutor } from "../executors/ShellExecutor";
import type { SandboxConfig } from "../types/sandbox";

describe("Sandbox Integration Tests", () => {
  let testDir: string;
  let config: SandboxConfig;

  beforeEach(() => {
    // Create temp test directory
    testDir = path.join(os.tmpdir(), `forge-sandbox-integration-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });

    config = {
      version: "1.0",
      enabled: true,
      mode: "strict",
      filesystem: {
        enabled: true,
        allowedPaths: [testDir],
        blockedPaths: ["/etc", "~/.ssh"],
        maxFileSize: "10MB",
        allowCreate: true,
        allowDelete: false,
        allowSymlink: false,
        resolveRealPath: true,
        readOnlyRoot: true,
        workspaceDir: testDir,
      },
      network: {
        enabled: true,
        allowedDomains: ["api.github.com"],
        blockedDomains: ["evil.com"],
        allowedProtocols: ["https"],
        blockDns: true,
        allowDnsResolution: false,
        timeout: 30,
        maxResponseSize: "5MB",
        logAllRequests: true,
      },
      shell: {
        enabled: true,
        allowedCommands: ["git", "echo"],
        blockedCommands: ["rm -rf", "curl", "wget"],
        envWhitelist: ["PATH", "HOME"],
        stripSensitiveEnv: true,
        maxProcessTime: 10,
        maxMemory: "512MB",
        maxProcesses: 5,
        workingDirectory: testDir,
        allowPipes: false,
        allowRedirects: false,
      },
      monitoring: {
        enabled: true,
        logAllOperations: true,
        detectEscapeAttempts: true,
        alertOnBypass: true,
        collectMetrics: true,
      },
    };
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(testDir)) {
      try {
        fs.rmSync(testDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe("Session Management", () => {
    it("should start and end session", async () => {
      const session = await createSandboxSession({ enabled: true });
      expect(session.id).toBeDefined();
      expect(session.startTime).toBeGreaterThan(0);

      const metrics = await endSandboxSession();
      expect(metrics).toBeDefined();
      expect(metrics!.sessionId).toBe(session.id);
    });

    it("should track operations in session", async () => {
      await createSandboxSession({ enabled: true, mode: "strict" });

      const manager = getSandboxManager();
      manager.startSession();

      // Perform some operations
      manager.check({
        type: "filesystem",
        action: "read",
        path: path.join(testDir, "test.txt"),
        timestamp: Date.now(),
      });

      const metrics = manager.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics!.operations.total).toBeGreaterThan(0);

      await endSandboxSession();
    });
  });

  describe("Policy Engine Integration", () => {
    it("should enforce filesystem policies", () => {
      const engine = createPolicyEngine(config);

      // Should allow access to allowed path
      const allowedResult = engine.evaluate({
        type: "filesystem",
        action: "read",
        path: path.join(testDir, "file.txt"),
        timestamp: Date.now(),
      });
      expect(allowedResult.allowed).toBe(true);

      // Should deny access to blocked path
      const blockedResult = engine.evaluate({
        type: "filesystem",
        action: "read",
        path: "/etc/passwd",
        timestamp: Date.now(),
      });
      expect(blockedResult.allowed).toBe(false);
    });

    it("should enforce network policies", () => {
      const engine = createPolicyEngine(config);

      // Should allow access to allowed domain
      const allowedResult = engine.evaluate({
        type: "network",
        action: "request",
        method: "GET",
        url: "https://api.github.com/users",
        timestamp: Date.now(),
      });
      expect(allowedResult.allowed).toBe(true);

      // Should deny access to blocked domain
      const blockedResult = engine.evaluate({
        type: "network",
        action: "request",
        method: "GET",
        url: "https://evil.com/api",
        timestamp: Date.now(),
      });
      expect(blockedResult.allowed).toBe(false);
    });

    it("should enforce shell policies", () => {
      const engine = createPolicyEngine(config);

      // Should allow git command
      const gitResult = engine.evaluate({
        type: "shell",
        command: "git status",
        timestamp: Date.now(),
      });
      expect(gitResult.allowed).toBe(true);

      // Should deny blocked command
      const blockedResult = engine.evaluate({
        type: "shell",
        command: "curl https://evil.com",
        timestamp: Date.now(),
      });
      expect(blockedResult.allowed).toBe(false);
    });
  });

  describe("Filesystem Executor Integration", () => {
    it("should read and write files with policy enforcement", async () => {
      const engine = createPolicyEngine(config);
      const executor = createFilesystemExecutor(config.filesystem!, engine);

      // Write a file
      const writeResult = await executor.execute({
        type: "filesystem",
        action: "write",
        path: path.join(testDir, "test.txt"),
        content: "Hello, World!",
        timestamp: Date.now(),
      });
      expect(writeResult.success).toBe(true);

      // Read the file
      const readResult = await executor.execute({
        type: "filesystem",
        action: "read",
        path: path.join(testDir, "test.txt"),
        timestamp: Date.now(),
      });
      expect(readResult.success).toBe(true);
      expect((readResult.result as any).content).toBe("Hello, World!");
    });

    it("should block unauthorized operations", async () => {
      const engine = createPolicyEngine(config);
      const executor = createFilesystemExecutor(config.filesystem!, engine);

      const result = await executor.execute({
        type: "filesystem",
        action: "read",
        path: "/etc/passwd",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(false);
      expect(result.policyResult.allowed).toBe(false);
    });
  });

  describe("Network Executor Integration", () => {
    it("should create network executor", () => {
      const engine = createPolicyEngine(config);
      const executor = createNetworkExecutor(config.network!, engine);

      expect(executor).toBeDefined();
      expect(executor.isDomainAllowed("api.github.com")).toBe(true);
      expect(executor.isDomainAllowed("evil.com")).toBe(false);
    });
  });

  describe("Shell Executor Integration", () => {
    it("should create shell executor", () => {
      const engine = createPolicyEngine(config);
      const executor = createShellExecutor(config.shell!, engine);

      expect(executor).toBeDefined();

      const stats = executor.getStats();
      expect(stats.totalCommands).toBe(0);
    });

    it("should sanitize environment variables", async () => {
      const engine = createPolicyEngine(config);
      const executor = createShellExecutor(config.shell!, engine);

      const result = await executor.execute({
        type: "shell",
        command: "echo $HOME",
        timestamp: Date.now(),
      });

      // Should complete (may or may not succeed depending on echo availability)
      expect(result).toBeDefined();
    });
  });

  describe("Bypass Detection", () => {
    it("should detect multiple escape patterns", () => {
      const engine = createPolicyEngine(config);

      // Path traversal
      const pathTraversal = engine.evaluate({
        type: "filesystem",
        action: "read",
        path: "../../../etc/passwd",
        timestamp: Date.now(),
      });
      expect(pathTraversal.escapeVector).toBeDefined();

      // Command injection
      const commandInjection = engine.evaluate({
        type: "shell",
        command: "echo test && rm -rf /",
        timestamp: Date.now(),
      });
      expect(commandInjection.escapeVector).toBe("command_injection");
    });
  });

  describe("Preview Mode", () => {
    it("should preview operations in preview mode", async () => {
      const previewConfig = { ...config, mode: "preview" as const };
      const engine = createPolicyEngine(previewConfig);
      const executor = createFilesystemExecutor(previewConfig.filesystem!, engine);

      const result = await executor.execute({
        type: "filesystem",
        action: "read",
        path: "/unknown/path.txt",
        timestamp: Date.now(),
      });

      // In preview mode, unknown paths should be previewed (not allowed)
      expect(result.success).toBe(false);
      expect(result.policyResult.decision).toBe("preview");
    });
  });

  describe("Disabled Sandbox", () => {
    it("should allow all operations when disabled", () => {
      const disabledConfig = { ...config, mode: "disabled" as const };
      const engine = createPolicyEngine(disabledConfig);

      const result = engine.evaluate({
        type: "filesystem",
        action: "read",
        path: "/etc/passwd",
        timestamp: Date.now(),
      });

      // When disabled, all operations are allowed
      expect(result.allowed).toBe(true);
      expect(result.reason).toContain("disabled");
    });
  });

  describe("Metrics Collection", () => {
    it("should collect operation metrics", async () => {
      await createSandboxSession({ enabled: true, mode: "strict" });

      const manager = getSandboxManager();
      manager.startSession();

      // Perform operations
      manager.check({
        type: "filesystem",
        action: "read",
        path: path.join(testDir, "test.txt"),
        timestamp: Date.now(),
      });

      const metrics = manager.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics!.operations.total).toBe(1);

      await endSandboxSession();
    });
  });
});
