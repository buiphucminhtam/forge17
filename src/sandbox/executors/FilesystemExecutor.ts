/**
 * Filesystem Executor - Sandboxed filesystem operations
 *
 * Implements safe filesystem operations based on policy engine decisions.
 * Based on research from Tian Pan (2026) - Agent Sandboxing Spectrum
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  FilesystemConfig,
  FilesystemOperation,
  PolicyResult,
} from "../types/sandbox.js";
import { PolicyEngine } from "../manager/PolicyEngine.js";

export interface FileMetadata {
  size: number;
  modified: number;
  created: number;
  permissions: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
}

export interface ReadResult {
  content: string;
  metadata: FileMetadata;
}

export interface WriteResult {
  path: string;
  bytesWritten: number;
}

export interface ListResult {
  entries: string[];
  directories: string[];
  files: string[];
}

/**
 * Filesystem Executor - Performs sandboxed filesystem operations
 */
export class FilesystemExecutor {
  private config: FilesystemConfig;
  private policyEngine: PolicyEngine;
  private workspaceDir: string;

  constructor(config: FilesystemConfig, policyEngine: PolicyEngine) {
    this.config = config;
    this.policyEngine = policyEngine;
    this.workspaceDir = config.workspaceDir || "/tmp/forge-sandbox";
  }

  /**
   * Update config
   */
  updateConfig(config: FilesystemConfig): void {
    this.config = config;
  }

  /**
   * Execute a filesystem operation
   */
  async execute(operation: FilesystemOperation): Promise<{
    success: boolean;
    result?: unknown;
    error?: string;
    policyResult: PolicyResult;
  }> {
    // Evaluate policy
    const policyResult = this.policyEngine.evaluate(operation);

    if (!policyResult.allowed) {
      return {
        success: false,
        error: policyResult.reason,
        policyResult,
      };
    }

    if (policyResult.decision === "preview") {
      return {
        success: false,
        error: "Preview mode: operation requires confirmation",
        policyResult,
      };
    }

    // Execute the operation
    try {
      let result: unknown;

      switch (operation.action) {
        case "read":
          result = await this.read(operation.path);
          break;
        case "write":
          result = await this.write(operation.path, operation.content || "");
          break;
        case "delete":
          result = await this.delete(operation.path);
          break;
        case "exists":
          result = await this.exists(operation.path);
          break;
        case "list":
          result = await this.list(operation.path);
          break;
        case "stat":
          result = await this.stat(operation.path);
          break;
        default:
          return {
            success: false,
            error: `Unknown action: ${operation.action}`,
            policyResult,
          };
      }

      return {
        success: true,
        result,
        policyResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        policyResult,
      };
    }
  }

  /**
   * Read a file
   */
  async read(filePath: string): Promise<ReadResult> {
    const resolvedPath = this.resolvePath(filePath);

    // Check file size limit
    const stats = fs.statSync(resolvedPath);
    const maxSize = this.parseSize(this.config.maxFileSize || "10MB");

    if (stats.size > maxSize) {
      throw new Error(
        `File size ${stats.size} exceeds limit ${maxSize}`
      );
    }

    const content = fs.readFileSync(resolvedPath, "utf-8");
    const metadata = this.getMetadata(resolvedPath, stats);

    return { content, metadata };
  }

  /**
   * Write to a file
   */
  async write(filePath: string, content: string): Promise<WriteResult> {
    if (!this.config.allowCreate) {
      throw new Error("File creation is not allowed");
    }

    const resolvedPath = this.resolvePath(filePath);
    const dir = path.dirname(resolvedPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Check content size
    const maxSize = this.parseSize(this.config.maxFileSize || "10MB");
    if (Buffer.byteLength(content, "utf-8") > maxSize) {
      throw new Error(
        `Content size exceeds limit ${maxSize}`
      );
    }

    fs.writeFileSync(resolvedPath, content, "utf-8");

    return {
      path: resolvedPath,
      bytesWritten: Buffer.byteLength(content, "utf-8"),
    };
  }

  /**
   * Delete a file
   */
  async delete(filePath: string): Promise<void> {
    if (!this.config.allowDelete) {
      throw new Error("File deletion is not allowed");
    }

    const resolvedPath = this.resolvePath(filePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    fs.unlinkSync(resolvedPath);
  }

  /**
   * Check if file exists
   */
  async exists(filePath: string): Promise<boolean> {
    const resolvedPath = this.resolvePath(filePath);
    return fs.existsSync(resolvedPath);
  }

  /**
   * List directory contents
   */
  async list(dirPath: string): Promise<ListResult> {
    const resolvedPath = this.resolvePath(dirPath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Directory not found: ${dirPath}`);
    }

    const entries = fs.readdirSync(resolvedPath);
    const directories: string[] = [];
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(resolvedPath, entry);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        directories.push(entry);
      } else {
        files.push(entry);
      }
    }

    return { entries, directories, files };
  }

  /**
   * Get file/directory metadata
   */
  async stat(filePath: string): Promise<FileMetadata> {
    const resolvedPath = this.resolvePath(filePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Path not found: ${filePath}`);
    }

    const stats = fs.statSync(resolvedPath);
    return this.getMetadata(resolvedPath, stats);
  }

  /**
   * Create a sandboxed workspace directory
   */
  async createWorkspace(): Promise<string> {
    if (!fs.existsSync(this.workspaceDir)) {
      fs.mkdirSync(this.workspaceDir, { recursive: true });
    }
    return this.workspaceDir;
  }

  /**
   * Clean up workspace directory
   */
  async cleanupWorkspace(): Promise<void> {
    if (fs.existsSync(this.workspaceDir)) {
      // Only clean up files we created (not system files)
      const entries = fs.readdirSync(this.workspaceDir);
      for (const entry of entries) {
        const fullPath = path.join(this.workspaceDir, entry);
        try {
          fs.unlinkSync(fullPath);
        } catch {
          // Ignore errors during cleanup
        }
      }
    }
  }

  /**
   * Resolve path with sandbox restrictions
   */
  private resolvePath(inputPath: string): string {
    let resolved = inputPath;

    // Expand ~ to home directory
    if (resolved.startsWith("~")) {
      resolved = resolved.replace("~", process.env.HOME || "");
    }

    // Make absolute if relative
    if (!path.isAbsolute(resolved)) {
      resolved = path.resolve(resolved);
    }

    // Resolve symlinks if configured
    if (this.config.resolveRealPath) {
      try {
        resolved = fs.realpathSync(resolved);
      } catch {
        // File doesn't exist yet, that's ok
      }
    }

    return resolved;
  }

  /**
   * Get file metadata
   */
  private getMetadata(
    filePath: string,
    stats: fs.Stats
  ): FileMetadata {
    return {
      size: stats.size,
      modified: stats.mtimeMs,
      created: stats.birthtimeMs,
      permissions: this.getPermissions(stats.mode),
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      isSymlink: stats.isSymbolicLink(),
    };
  }

  /**
   * Get permissions string (e.g., "rwxr-xr-x")
   */
  private getPermissions(mode: number): string {
    const perms = [];
    const bits = [
      { bit: 0o400, char: "r" },
      { bit: 0o200, char: "w" },
      { bit: 0o100, char: "x" },
    ];

    for (let i = 2; i >= 0; i--) {
      for (const { bit, char } of bits) {
        perms.push((mode & (bit << i)) ? char : "-");
      }
    }

    return perms.join("");
  }

  /**
   * Parse size string (e.g., "10MB") to bytes
   */
  private parseSize(size: string): number {
    const match = size.match(/^(\d+)([KMG]?B?)$/i);
    if (!match) {
      return parseInt(size, 10) || 10 * 1024 * 1024; // Default 10MB
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toUpperCase();

    switch (unit) {
      case "K":
      case "KB":
        return value * 1024;
      case "M":
      case "MB":
        return value * 1024 * 1024;
      case "G":
      case "GB":
        return value * 1024 * 1024 * 1024;
      default:
        return value;
    }
  }

  /**
   * Generate a unique ID for operations
   */
  generateOperationId(): string {
    return crypto.randomUUID();
  }
}

/**
 * Factory function
 */
export function createFilesystemExecutor(
  config: FilesystemConfig,
  policyEngine: PolicyEngine
): FilesystemExecutor {
  return new FilesystemExecutor(config, policyEngine);
}
