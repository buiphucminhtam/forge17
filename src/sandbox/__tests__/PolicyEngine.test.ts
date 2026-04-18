/**
 * Policy Engine Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PolicyEngine, createPolicyEngine } from "../manager/PolicyEngine";
import type {
  SandboxConfig,
  FilesystemOperation,
  NetworkOperation,
  ShellOperation,
  PolicyResult,
} from "../types/sandbox";

describe("PolicyEngine", () => {
  let engine: PolicyEngine;
  let config: SandboxConfig;

  beforeEach(() => {
    config = {
      version: "1.0",
      enabled: true,
      mode: "strict",
      filesystem: {
        enabled: true,
        allowedPaths: ["./src", "./tests"],
        blockedPaths: ["/etc", "~/.ssh", "/var/run/docker.sock"],
        maxFileSize: "10MB",
        allowCreate: true,
        allowDelete: false,
        allowSymlink: false,
        resolveRealPath: true,
        readOnlyRoot: true,
        workspaceDir: "/tmp/forge-sandbox",
      },
      network: {
        enabled: true,
        allowedDomains: ["api.github.com", "pypi.org"],
        blockedDomains: ["evil.com", "localhost"],
        allowedProtocols: ["https"],
        blockDns: true,
        allowDnsResolution: false,
        timeout: 30,
        maxResponseSize: "5MB",
        logAllRequests: true,
      },
      shell: {
        enabled: true,
        allowedCommands: ["git", "npm", "python"],
        blockedCommands: ["rm -rf", "curl", "wget", "ssh"],
        envWhitelist: ["PATH", "HOME"],
        stripSensitiveEnv: true,
        maxProcessTime: 60,
        maxMemory: "512MB",
        maxProcesses: 10,
        workingDirectory: "./",
        allowPipes: false,
        allowRedirects: false,
      },
      monitoring: {
        enabled: true,
        detectEscapeAttempts: true,
      },
    };

    engine = createPolicyEngine(config);
  });

  describe("Filesystem Operations", () => {
    it("should allow read in allowed path", () => {
      const operation: FilesystemOperation = {
        type: "filesystem",
        action: "read",
        path: "./src/index.ts",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(true);
      expect(result.decision).toBe("allow");
    });

    it("should deny read in blocked path", () => {
      const operation: FilesystemOperation = {
        type: "filesystem",
        action: "read",
        path: "/etc/passwd",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.decision).toBe("deny");
    });

    it("should deny path traversal attempt", () => {
      const operation: FilesystemOperation = {
        type: "filesystem",
        action: "read",
        path: "../../../etc/passwd",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.decision).toBe("deny");
    });

    it("should deny docker socket access", () => {
      const operation: FilesystemOperation = {
        type: "filesystem",
        action: "read",
        path: "/var/run/docker.sock",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.escapeVector).toBe("docker_socket");
    });

    it("should deny delete when allowDelete is false", () => {
      const operation: FilesystemOperation = {
        type: "filesystem",
        action: "delete",
        path: "./src/index.ts",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("File deletion is not allowed");
    });

    it("should deny config file poisoning attempt", () => {
      const operation: FilesystemOperation = {
        type: "filesystem",
        action: "write",
        path: "~/.gitconfig",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.escapeVector).toBe("config_poisoning");
    });

    it("should allow write in allowed path", () => {
      const operation: FilesystemOperation = {
        type: "filesystem",
        action: "write",
        path: "./src/new-file.ts",
        content: "console.log('hello');",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(true);
    });
  });

  describe("Network Operations", () => {
    it("should allow request to allowed domain", () => {
      const operation: NetworkOperation = {
        type: "network",
        action: "request",
        method: "GET",
        url: "https://api.github.com/users",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(true);
      expect(result.decision).toBe("allow");
    });

    it("should deny request to blocked domain", () => {
      const operation: NetworkOperation = {
        type: "network",
        action: "request",
        method: "GET",
        url: "https://evil.com/api/data",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.decision).toBe("deny");
    });

    it("should deny HTTP protocol when only HTTPS allowed", () => {
      const operation: NetworkOperation = {
        type: "network",
        action: "request",
        method: "GET",
        url: "http://api.github.com/users",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Protocol not allowed");
    });

    it("should deny localhost access", () => {
      const operation: NetworkOperation = {
        type: "network",
        action: "request",
        method: "GET",
        url: "https://localhost:3000/api",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
    });
  });

  describe("Shell Operations", () => {
    it("should allow git command", () => {
      const operation: ShellOperation = {
        type: "shell",
        command: "git status",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(true);
    });

    it("should deny blocked command", () => {
      const operation: ShellOperation = {
        type: "shell",
        command: "curl https://evil.com",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.escapeVector).toBe("command_injection");
    });

    it("should deny command with pipes", () => {
      const operation: ShellOperation = {
        type: "shell",
        command: "git status | grep modified",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.escapeVector).toBe("command_injection");
    });

    it("should deny shell metacharacters", () => {
      const operation: ShellOperation = {
        type: "shell",
        command: "git status && rm -rf /",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.escapeVector).toBe("command_injection");
    });

    it("should deny command injection via $()", () => {
      const operation: ShellOperation = {
        type: "shell",
        command: "echo $(whoami)",
        timestamp: Date.now(),
      };

      const result = engine.evaluate(operation);
      expect(result.allowed).toBe(false);
      expect(result.escapeVector).toBe("command_injection");
    });
  });

  describe("Preview Mode", () => {
    it("should preview (not deny) unknown paths in preview mode", () => {
      const previewConfig = { ...config, mode: "preview" as const };
      const previewEngine = createPolicyEngine(previewConfig);

      const operation: FilesystemOperation = {
        type: "filesystem",
        action: "read",
        path: "./unknown/path/file.ts",
        timestamp: Date.now(),
      };

      const result = previewEngine.evaluate(operation);
      expect(result.decision).toBe("preview");
    });
  });

  describe("Disabled Sandbox", () => {
    it("should allow all operations when disabled", () => {
      const disabledConfig = { ...config, mode: "disabled" as const };
      const disabledEngine = createPolicyEngine(disabledConfig);

      const operation: FilesystemOperation = {
        type: "filesystem",
        action: "read",
        path: "/etc/passwd",
        timestamp: Date.now(),
      };

      const result = disabledEngine.evaluate(operation);
      expect(result.allowed).toBe(true);
      expect(result.reason).toContain("disabled");
    });
  });

  describe("Escape Vector Detection", () => {
    it("should detect path traversal patterns", () => {
      const patterns = engine.getMonitoredEscapeVectors();
      expect(patterns).toContain("path_traversal");
    });

    it("should detect command injection", () => {
      const patterns = engine.getMonitoredEscapeVectors();
      expect(patterns).toContain("command_injection");
    });

    it("should detect docker socket access", () => {
      const patterns = engine.getMonitoredEscapeVectors();
      expect(patterns).toContain("docker_socket");
    });
  });

  describe("Config Validation", () => {
    it("should validate secure config", () => {
      const validation = engine.validateConfig();
      // Config is secure if no critical warnings
      expect(validation.warnings.filter((w) => w.includes("dangerous"))).toHaveLength(0);
    });

    it("should warn about permissive config", () => {
      const permissiveConfig = {
        ...config,
        shell: {
          ...config.shell!,
          allowPipes: true,
        },
      };
      const permissiveEngine = createPolicyEngine(permissiveConfig);
      const validation = permissiveEngine.validateConfig();

      expect(validation.warnings.some((w) => w.includes("pipes"))).toBe(true);
    });
  });
});
