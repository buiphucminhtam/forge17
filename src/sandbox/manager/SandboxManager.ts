/**
 * Sandbox Manager - Main orchestrator for sandbox operations
 *
 * Provides a unified API for sandboxed code execution with:
 * - Policy evaluation before execution
 * - Operation interception and logging
 * - Session management
 * - Metrics collection
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  SandboxConfig,
  SandboxOperation,
  PolicyResult,
  AuditLogEntry,
  SandboxMetrics,
  FilesystemOperation,
  NetworkOperation,
  ShellOperation,
} from "../types/sandbox.js";
import { ConfigLoader, loadSandboxConfig, type LoadedConfig } from "./ConfigLoader.js";
import { PolicyEngine, createPolicyEngine } from "./PolicyEngine.js";
import { AuditLogger } from "../monitors/AuditLogger.js";
import { BypassDetector } from "../monitors/BypassDetector.js";

export interface SandboxSession {
  id: string;
  startTime: number;
  config: SandboxConfig;
  metrics: SandboxMetrics;
}

export interface SandboxResult<T = unknown> {
  success: boolean;
  operation: SandboxOperation;
  policyResult: PolicyResult;
  result?: T;
  error?: string;
  duration: number;
  auditId: string;
}

export interface SandboxCheckResult {
  allowed: boolean;
  decision: "allow" | "deny" | "preview";
  reason: string;
  requiresConfirmation?: boolean;
}

/**
 * Sandbox Manager - Main orchestrator
 */
export class SandboxManager {
  private configLoader: ConfigLoader;
  private policyEngine: PolicyEngine;
  private auditLogger: AuditLogger;
  private bypassDetector: BypassDetector;

  private currentConfig: SandboxConfig;
  private currentSession: SandboxSession | null = null;

  constructor() {
    this.configLoader = new ConfigLoader();
    const loaded = this.configLoader.load();
    this.currentConfig = loaded.config;

    this.policyEngine = createPolicyEngine(this.currentConfig);
    this.auditLogger = new AuditLogger(this.currentConfig);
    this.bypassDetector = new BypassDetector();

    // Apply any config warnings
    if (loaded.warnings.length > 0) {
      console.warn("Sandbox config warnings:", loaded.warnings);
    }
  }

  /**
   * Initialize sandbox with optional custom config
   */
  async initialize(customConfig?: Partial<SandboxConfig>): Promise<void> {
    const loaded = this.configLoader.load(customConfig);
    this.currentConfig = loaded.config;

    this.policyEngine.updateConfig(this.currentConfig);
    this.auditLogger.updateConfig(this.currentConfig);

    console.log(this.configLoader.getSummary(this.currentConfig));
  }

  /**
   * Start a new sandbox session
   */
  startSession(): SandboxSession {
    const sessionId = crypto.randomUUID();

    this.currentSession = {
      id: sessionId,
      startTime: Date.now(),
      config: this.currentConfig,
      metrics: {
        sessionId,
        startTime: Date.now(),
        operations: {
          total: 0,
          allowed: 0,
          denied: 0,
          byType: {
            filesystem: { allowed: 0, denied: 0 },
            network: { allowed: 0, denied: 0 },
            shell: { allowed: 0, denied: 0 },
          },
        },
        escapeAttempts: {
          total: 0,
          byType: {},
        },
        averageLatencyMs: 0,
      },
    };

    return this.currentSession;
  }

  /**
   * End the current session and finalize metrics
   */
  endSession(): SandboxMetrics | null {
    if (!this.currentSession) {
      return null;
    }

    const metrics = {
      ...this.currentSession.metrics,
      endTime: Date.now(),
    };

    // Write final metrics
    if (this.currentConfig.monitoring?.collectMetrics) {
      const metricsPath = this.currentConfig.monitoring?.metricsPath || ".forgewright/sandbox-metrics.json";
      try {
        const dir = path.dirname(metricsPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
      } catch (error) {
        console.error("Failed to write metrics:", error);
      }
    }

    this.currentSession = null;
    return metrics;
  }

  /**
   * Check if an operation is allowed (without executing)
   */
  check(operation: SandboxOperation): SandboxCheckResult {
    const startTime = Date.now();
    const auditId = crypto.randomUUID();

    // Add session ID if available
    if (this.currentSession) {
      operation.sessionId = this.currentSession.id;
    }

    // Evaluate policy
    const policyResult = this.policyEngine.evaluate(operation);

    // Log the check
    this.auditLogger.log({
      id: auditId,
      timestamp: Date.now(),
      sessionId: operation.sessionId,
      operation,
      result: policyResult,
      duration: Date.now() - startTime,
    });

    // Update metrics
    this.updateMetrics(operation, policyResult);

    // Check for escape attempts
    if (policyResult.escapeVector) {
      this.bypassDetector.recordEscapeAttempt(
        policyResult.escapeVector,
        operation
      );
    }

    return {
      allowed: policyResult.allowed,
      decision: policyResult.decision,
      reason: policyResult.reason,
      requiresConfirmation: policyResult.decision === "preview",
    };
  }

  /**
   * Execute a filesystem operation with sandbox
   */
  async executeFilesystem(
    action: FilesystemOperation["action"],
    filePath: string,
    options?: {
      content?: string;
      metadata?: FilesystemOperation["metadata"];
    }
  ): Promise<SandboxResult<void>> {
    const operation: FilesystemOperation = {
      type: "filesystem",
      action,
      path: filePath,
      content: options?.content,
      metadata: options?.metadata,
      timestamp: Date.now(),
      sessionId: this.currentSession?.id,
    };

    return this.execute(operation);
  }

  /**
   * Execute a network operation with sandbox
   */
  async executeNetwork(
    method: NetworkOperation["method"],
    url: string,
    options?: {
      headers?: Record<string, string>;
      body?: string;
    }
  ): Promise<SandboxResult<NetworkResponse>> {
    const operation: NetworkOperation = {
      type: "network",
      action: "request",
      method,
      url,
      headers: options?.headers,
      body: options?.body,
      timestamp: Date.now(),
      sessionId: this.currentSession?.id,
    };

    return this.execute(operation);
  }

  /**
   * Execute a shell command with sandbox
   */
  async executeShell(
    command: string,
    options?: {
      args?: string[];
      env?: Record<string, string>;
      cwd?: string;
    }
  ): Promise<SandboxResult<ShellResult>> {
    const operation: ShellOperation = {
      type: "shell",
      command,
      args: options?.args,
      env: options?.env,
      cwd: options?.cwd,
      timestamp: Date.now(),
      sessionId: this.currentSession?.id,
    };

    return this.execute(operation);
  }

  /**
   * Generic execute method
   */
  private async execute<T>(
    operation: SandboxOperation
  ): Promise<SandboxResult<T>> {
    const startTime = Date.now();
    const auditId = crypto.randomUUID();

    // Check policy first
    const policyResult = this.policyEngine.evaluate(operation);

    // Log the operation
    this.auditLogger.log({
      id: auditId,
      timestamp: Date.now(),
      sessionId: operation.sessionId,
      operation,
      result: policyResult,
      duration: Date.now() - startTime,
    });

    // Update metrics
    this.updateMetrics(operation, policyResult);

    // Check for escape attempts
    if (policyResult.escapeVector) {
      this.bypassDetector.recordEscapeAttempt(
        policyResult.escapeVector,
        operation
      );

      return {
        success: false,
        operation,
        policyResult,
        error: `Escape attempt detected: ${policyResult.escapeVector}`,
        duration: Date.now() - startTime,
        auditId,
      };
    }

    // If denied, return error
    if (!policyResult.allowed) {
      return {
        success: false,
        operation,
        policyResult,
        error: policyResult.reason,
        duration: Date.now() - startTime,
        auditId,
      };
    }

    // In preview mode, don't execute
    if (policyResult.decision === "preview") {
      return {
        success: false,
        operation,
        policyResult,
        error: "Preview mode: execution blocked pending confirmation",
        duration: Date.now() - startTime,
        auditId,
      };
    }

    // Execute the operation
    try {
      const result = await this.performOperation(operation);
      return {
        success: true,
        operation,
        policyResult,
        result: result as T,
        duration: Date.now() - startTime,
        auditId,
      };
    } catch (error) {
      return {
        success: false,
        operation,
        policyResult,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        auditId,
      };
    }
  }

  /**
   * Perform the actual operation (stub - implement actual execution)
   */
  private async performOperation(
    operation: SandboxOperation
  ): Promise<unknown> {
    switch (operation.type) {
      case "filesystem":
        return this.performFilesystemOperation(operation);
      case "network":
        return this.performNetworkOperation(operation);
      case "shell":
        return this.performShellOperation(operation);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private async performFilesystemOperation(
    operation: FilesystemOperation
  ): Promise<void> {
    const filePath = operation.path;

    switch (operation.action) {
      case "read": {
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }
        return fs.readFileSync(filePath, "utf-8") as unknown as void;
      }

      case "write": {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, operation.content || "");
        return;
      }

      case "delete": {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return;
      }

      case "exists": {
        return fs.existsSync(filePath);
      }

      case "list": {
        return fs.readdirSync(filePath);
      }

      case "stat": {
        return fs.statSync(filePath);
      }

      default:
        throw new Error(`Unknown filesystem action: ${operation.action}`);
    }
  }

  private async performNetworkOperation(
    operation: NetworkOperation
  ): Promise<NetworkResponse> {
    // This is a stub - actual implementation would use fetch or http client
    // with the sandbox restrictions applied
    const timeout = this.currentConfig.network?.timeout || 30;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

    try {
      const response = await fetch(operation.url, {
        method: operation.method || "GET",
        headers: operation.headers,
        body: operation.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async performShellOperation(
    operation: ShellOperation
  ): Promise<ShellResult> {
    // This is a stub - actual implementation would use child_process
    // with the sandbox restrictions applied
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    const cwd = operation.cwd || this.currentConfig.shell?.workingDirectory || "./";
    const maxTime = this.currentConfig.shell?.maxProcessTime || 60;

    try {
      const { stdout, stderr } = await execAsync(operation.command, {
        cwd,
        timeout: maxTime * 1000,
        env: this.sanitizeEnv(operation.env),
      });

      return {
        stdout,
        stderr,
        exitCode: 0,
      };
    } catch (error: any) {
      return {
        stdout: error.stdout || "",
        stderr: error.stderr || "",
        exitCode: error.code || 1,
        error: error.message,
      };
    }
  }

  /**
   * Sanitize environment variables for shell execution
   */
  private sanitizeEnv(
    env?: Record<string, string>
  ): NodeJS.ProcessEnv {
    const allowed = this.currentConfig.shell?.envWhitelist || [
      "PATH",
      "HOME",
      "USER",
    ];

    const result: NodeJS.ProcessEnv = {};

    // Add allowed environment variables
    for (const key of allowed) {
      if (process.env[key]) {
        result[key] = process.env[key]!;
      }
    }

    // Add custom environment variables (strip sensitive ones)
    if (env) {
      for (const [key, value] of Object.entries(env)) {
        if (!this.isSensitiveKey(key)) {
          result[key] = value;
        }
      }
    }

    return result;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitivePatterns = [
      /key/i,
      /secret/i,
      /password/i,
      /token/i,
      /auth/i,
      /credential/i,
      /private/i,
      /^api_/i,
      /^AWS_/i,
      /^GITHUB_/i,
    ];

    return sensitivePatterns.some((pattern) => pattern.test(key));
  }

  /**
   * Update session metrics
   */
  private updateMetrics(
    operation: SandboxOperation,
    result: PolicyResult
  ): void {
    if (!this.currentSession) return;

    const metrics = this.currentSession.metrics;
    metrics.operations.total++;

    if (result.allowed) {
      metrics.operations.allowed++;
      metrics.operations.byType[operation.type].allowed++;
    } else {
      metrics.operations.denied++;
      metrics.operations.byType[operation.type].denied++;
    }

    if (result.escapeVector) {
      metrics.escapeAttempts.total++;
      metrics.escapeAttempts.byType[result.escapeVector] =
        (metrics.escapeAttempts.byType[result.escapeVector] || 0) + 1;
    }

    // Calculate average latency
    const totalDuration = metrics.averageLatencyMs * (metrics.operations.total - 1);
    metrics.averageLatencyMs = (totalDuration + 0) / metrics.operations.total;
  }

  /**
   * Get current session metrics
   */
  getMetrics(): SandboxMetrics | null {
    return this.currentSession?.metrics || null;
  }

  /**
   * Get bypass detector status
   */
  getBypassStatus(): {
    totalAttempts: number;
    recentAttempts: Array<{
      type: string;
      timestamp: number;
      operation: string;
    }>;
    blocked: boolean;
  } {
    return this.bypassDetector.getStatus();
  }

  /**
   * Get audit log entries
   */
  getAuditLog(limit?: number): AuditLogEntry[] {
    return this.auditLogger.getEntries(limit);
  }

  /**
   * Check if sandbox is enabled
   */
  isEnabled(): boolean {
    return this.currentConfig.enabled;
  }

  /**
   * Get current mode
   */
  getMode(): SandboxConfig["mode"] {
    return this.currentConfig.mode;
  }

  /**
   * Get current isolation level
   */
  getIsolationLevel(): string {
    return this.currentConfig.isolation?.level || "none";
  }
}

// Type definitions for operation results
interface NetworkResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}

interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
}

// Singleton instance
let sandboxManagerInstance: SandboxManager | null = null;

export function getSandboxManager(): SandboxManager {
  if (!sandboxManagerInstance) {
    sandboxManagerInstance = new SandboxManager();
  }
  return sandboxManagerInstance;
}

export async function createSandboxSession(
  customConfig?: Partial<SandboxConfig>
): Promise<SandboxSession> {
  const manager = getSandboxManager();
  await manager.initialize(customConfig);
  return manager.startSession();
}

export async function endSandboxSession(): Promise<SandboxMetrics | null> {
  return getSandboxManager().endSession();
}
