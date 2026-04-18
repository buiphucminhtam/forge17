/**
 * Filesystem Executor Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { FilesystemExecutor, createFilesystemExecutor } from "../executors/FilesystemExecutor";
import { PolicyEngine, createPolicyEngine } from "../manager/PolicyEngine";
import type { SandboxConfig, FilesystemOperation } from "../types/sandbox";
import fs from "fs";
import path from "path";
import os from "os";

describe("FilesystemExecutor", () => {
  let executor: FilesystemExecutor;
  let policyEngine: PolicyEngine;
  let testDir: string;
  let config: SandboxConfig;

  beforeEach(() => {
    // Create temp test directory
    testDir = path.join(os.tmpdir(), `forge-sandbox-test-${Date.now()}`);
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
    };

    policyEngine = createPolicyEngine(config);
    executor = createFilesystemExecutor(config.filesystem!, policyEngine);
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

  describe("read()", () => {
    it("should read a file in allowed directory", async () => {
      const testFile = path.join(testDir, "test.txt");
      fs.writeFileSync(testFile, "Hello, World!");

      const result = await executor.read(testFile);

      expect(result.content).toBe("Hello, World!");
      expect(result.metadata.isFile).toBe(true);
    });

    it("should throw error for non-existent file", async () => {
      const testFile = path.join(testDir, "nonexistent.txt");

      await expect(executor.read(testFile)).rejects.toThrow();
    });
  });

  describe("write()", () => {
    it("should create a new file", async () => {
      const testFile = path.join(testDir, "new-file.txt");

      const result = await executor.write(testFile, "New content");

      expect(result.path).toBe(testFile);
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, "utf-8")).toBe("New content");
    });

    it("should create parent directories", async () => {
      const nestedFile = path.join(testDir, "a", "b", "c", "file.txt");

      const result = await executor.write(nestedFile, "Nested content");

      expect(result.path).toBe(nestedFile);
      expect(fs.existsSync(nestedFile)).toBe(true);
    });

    it("should reject when allowCreate is false", async () => {
      const restrictiveConfig = {
        ...config,
        filesystem: {
          ...config.filesystem!,
          allowCreate: false,
        },
      };
      const restrictiveEngine = createPolicyEngine(restrictiveConfig);
      const restrictiveExecutor = createFilesystemExecutor(
        restrictiveConfig.filesystem!,
        restrictiveEngine
      );

      const testFile = path.join(testDir, "blocked.txt");

      const result = await restrictiveExecutor.execute({
        type: "filesystem",
        action: "write",
        path: testFile,
        content: "content",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("not allowed");
    });
  });

  describe("delete()", () => {
    it("should deny delete when allowDelete is false", async () => {
      const testFile = path.join(testDir, "to-delete.txt");
      fs.writeFileSync(testFile, "Content");

      const result = await executor.execute({
        type: "filesystem",
        action: "delete",
        path: testFile,
        timestamp: Date.now(),
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("deletion is not allowed");
    });
  });

  describe("exists()", () => {
    it("should return true for existing file", async () => {
      const testFile = path.join(testDir, "exists.txt");
      fs.writeFileSync(testFile, "Content");

      const result = await executor.exists(testFile);

      expect(result).toBe(true);
    });

    it("should return false for non-existing file", async () => {
      const result = await executor.exists(path.join(testDir, "nonexistent.txt"));

      expect(result).toBe(false);
    });
  });

  describe("list()", () => {
    it("should list directory contents", async () => {
      fs.writeFileSync(path.join(testDir, "file1.txt"), "Content1");
      fs.writeFileSync(path.join(testDir, "file2.txt"), "Content2");
      fs.mkdirSync(path.join(testDir, "subdir"));
      fs.writeFileSync(path.join(testDir, "subdir", "file3.txt"), "Content3");

      const result = await executor.list(testDir);

      expect(result.entries).toContain("file1.txt");
      expect(result.entries).toContain("file2.txt");
      expect(result.entries).toContain("subdir");
      expect(result.files).toContain("file1.txt");
      expect(result.files).toContain("file2.txt");
      expect(result.directories).toContain("subdir");
    });
  });

  describe("stat()", () => {
    it("should return file metadata", async () => {
      const testFile = path.join(testDir, "metadata.txt");
      fs.writeFileSync(testFile, "Content");

      const result = await executor.stat(testFile);

      expect(result.isFile).toBe(true);
      expect(result.isDirectory).toBe(false);
      expect(result.size).toBe(7); // "Content".length
      expect(result.permissions).toMatch(/rwx?/);
    });

    it("should throw for non-existent path", async () => {
      await expect(
        executor.stat(path.join(testDir, "nonexistent.txt"))
      ).rejects.toThrow();
    });
  });

  describe("policy enforcement", () => {
    it("should block access to blocked paths", async () => {
      const result = await executor.execute({
        type: "filesystem",
        action: "read",
        path: "/etc/passwd",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(false);
      expect(result.policyResult.allowed).toBe(false);
      expect(result.policyResult.escapeVector).toBeDefined();
    });

    it("should block access to docker socket", async () => {
      const result = await executor.execute({
        type: "filesystem",
        action: "read",
        path: "/var/run/docker.sock",
        timestamp: Date.now(),
      });

      expect(result.success).toBe(false);
      expect(result.policyResult.allowed).toBe(false);
      expect(result.policyResult.escapeVector).toMatch(/docker_socket|path_traversal/);
    });
  });
});
