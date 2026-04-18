/**
 * Shell Executor - Sandboxed shell command execution
 *
 * Implements safe shell command execution based on policy engine decisions.
 * Restricts commands, environment, and process resources.
 */

import { exec, spawn } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import {
  ShellConfig,
  ShellOperation,
  PolicyResult,
} from "../types/sandbox.js";
import { PolicyEngine } from "../manager/PolicyEngine.js";

const execAsync = promisify(exec);

export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
  command: string;
}

export interface ShellSpawnOptions {
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

/**
 * Shell Executor - Performs sandboxed shell operations
 */
export class ShellExecutor {
  private config: ShellConfig;
  private policyEngine: PolicyEngine;
  private commandLog: Array<{
    command: string;
    timestamp: number;
    exitCode?: number;
    duration: number;
    blocked?: boolean;
  }>;

  constructor(config: ShellConfig, policyEngine: PolicyEngine) {
    this.config = config;
    this.policyEngine = policyEngine;
    this.commandLog = [];
  }

  /**
   * Update config
   */
  updateConfig(config: ShellConfig): void {
    this.config = config;
  }

  /**
   * Execute a shell command
   */
  async execute(operation: ShellOperation): Promise<{
    success: boolean;
    result?: ShellResult;
    error?: string;
    policyResult: PolicyResult;
  }> {
    // Evaluate policy
    const policyResult = this.policyEngine.evaluate(operation);

    if (!policyResult.allowed) {
      this.logCommand(operation.command, undefined, 0, true);
      return {
        success: false,
        error: policyResult.reason,
        policyResult,
      };
    }

    if (policyResult.decision === "preview") {
      return {
        success: false,
        error: "Preview mode: command requires confirmation",
        policyResult,
      };
    }

    // Execute the command
    try {
      const startTime = Date.now();
      const result = await this.runCommand(operation);
      const duration = Date.now() - startTime;

      this.logCommand(operation.command, result.exitCode, duration, false);

      return {
        success: result.exitCode === 0,
        result: {
          ...result,
          command: operation.command,
          duration,
        },
        policyResult,
      };
    } catch (error) {
      const duration = 0;
      this.logCommand(operation.command, 1, duration, true);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        policyResult,
      };
    }
  }

  /**
   * Run a command with timeout
   */
  private async runCommand(operation: ShellOperation): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    const cwd = operation.cwd || this.config.workingDirectory || "./";
    const maxTime = this.config.maxProcessTime || 60;

    // Sanitize environment
    const env = this.sanitizeEnv(operation.env);

    try {
      const { stdout, stderr } = await execAsync(operation.command, {
        cwd: path.resolve(cwd),
        env,
        timeout: maxTime * 1000,
      });

      return {
        stdout: stdout || "",
        stderr: stderr || "",
        exitCode: 0,
      };
    } catch (error: any) {
      return {
        stdout: error.stdout || "",
        stderr: error.stderr || "",
        exitCode: error.code || 1,
      };
    }
  }

  /**
   * Spawn a subprocess (for long-running commands)
   */
  spawn(
    command: string,
    options?: ShellSpawnOptions
  ): {
    process: ReturnType<typeof spawn>;
    kill: () => void;
  } {
    const cwd = options?.cwd || this.config.workingDirectory || "./";
    const maxTime = this.config.maxProcessTime || 60;

    // Create operation for policy check
    const operation: ShellOperation = {
      type: "shell",
      command,
      args: options?.args,
      env: options?.env,
      cwd,
      timestamp: Date.now(),
    };

    // Evaluate policy
    const policyResult = this.policyEngine.evaluate(operation);

    if (!policyResult.allowed) {
      throw new Error(`Command blocked: ${policyResult.reason}`);
    }

    // Sanitize environment
    const env = this.sanitizeEnv(options?.env);

    const childProcess = spawn(command, options?.args || [], {
      cwd: path.resolve(cwd),
      env,
      stdio: "pipe",
    });

    // Set up timeout
    const timeoutId = setTimeout(() => {
      childProcess.kill("SIGTERM");
      setTimeout(() => {
        if (!childProcess.killed) {
          childProcess.kill("SIGKILL");
        }
      }, 5000);
    }, maxTime * 1000);

    // Clear timeout on exit
    childProcess.on("exit", () => {
      clearTimeout(timeoutId);
    });

    return {
      process: childProcess,
      kill: () => {
        clearTimeout(timeoutId);
        childProcess.kill("SIGTERM");
      },
    };
  }

  /**
   * Sanitize environment variables
   */
  private sanitizeEnv(customEnv?: Record<string, string>): NodeJS.ProcessEnv {
    const allowed = this.config.envWhitelist || [
      "PATH",
      "HOME",
      "USER",
      "TMPDIR",
      "PWD",
      "LANG",
      "LC_ALL",
    ];

    const result: NodeJS.ProcessEnv = {};

    // Add allowed environment variables from process.env
    for (const key of allowed) {
      if (process.env[key]) {
        result[key] = process.env[key]!;
      }
    }

    // Add custom environment variables (strip sensitive ones)
    if (customEnv) {
      for (const [key, value] of Object.entries(customEnv)) {
        if (!this.isSensitiveKey(key)) {
          result[key] = value;
        }
      }
    }

    // Ensure PATH is set
    if (!result.PATH) {
      result.PATH = process.env.PATH || "/usr/local/bin:/usr/bin:/bin";
    }

    return result;
  }

  /**
   * Check if an environment variable key is sensitive
   */
  private isSensitiveKey(key: string): boolean {
    if (!this.config.stripSensitiveEnv) {
      return false;
    }

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
      /^STRIPE_/i,
      /^OPENAI_/i,
      /^ANTHROPIC_/i,
    ];

    return sensitivePatterns.some((pattern) => pattern.test(key));
  }

  /**
   * Get command log
   */
  getCommandLog(): Array<{
    command: string;
    timestamp: number;
    exitCode?: number;
    duration: number;
    blocked?: boolean;
  }> {
    return [...this.commandLog];
  }

  /**
   * Clear command log
   */
  clearCommandLog(): void {
    this.commandLog = [];
  }

  /**
   * Log a command execution
   */
  private logCommand(
    command: string,
    exitCode: number | undefined,
    duration: number,
    blocked: boolean
  ): void {
    this.commandLog.push({
      command,
      timestamp: Date.now(),
      exitCode,
      duration,
      blocked,
    });

    // Trim log if too large
    if (this.commandLog.length > 10000) {
      this.commandLog = this.commandLog.slice(-5000);
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalCommands: number;
    blockedCommands: number;
    successfulCommands: number;
    failedCommands: number;
    averageDuration: number;
  } {
    const total = this.commandLog.length;
    const blocked = this.commandLog.filter((c) => c.blocked).length;
    const successful = this.commandLog.filter(
      (c) => !c.blocked && c.exitCode === 0
    ).length;
    const failed = this.commandLog.filter(
      (c) => !c.blocked && c.exitCode !== 0
    ).length;

    const totalDuration = this.commandLog.reduce(
      (sum, c) => sum + c.duration,
      0
    );
    const averageDuration = total > 0 ? totalDuration / total : 0;

    return {
      totalCommands: total,
      blockedCommands: blocked,
      successfulCommands: successful,
      failedCommands: failed,
      averageDuration,
    };
  }

  /**
   * Get temp directory for sandbox
   */
  getTempDir(): string {
    return path.join(os.tmpdir(), "forge-sandbox");
  }

  /**
   * Clean up temp files
   */
  async cleanupTemp(): Promise<void> {
    const tempDir = this.getTempDir();
    try {
      const { exec: execCmd } = await import("child_process");
      await execCmd(`rm -rf ${tempDir}`);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Factory function
 */
export function createShellExecutor(
  config: ShellConfig,
  policyEngine: PolicyEngine
): ShellExecutor {
  return new ShellExecutor(config, policyEngine);
}
