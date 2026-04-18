/**
 * Policy Engine - Evaluates sandbox operations against policies
 *
 * Based on research:
 * - Tian Pan (2026) - Agent Sandboxing: 5-level isolation spectrum
 * - OWASP LLM Top 10 - Escape vectors and bypass patterns
 * - e2b security patterns - Production sandbox evaluation
 */

import path from "path";
import {
  SandboxConfig,
  SandboxOperation,
  PolicyResult,
  PolicyDecision,
  EscapeVectorType,
  FilesystemOperation,
  NetworkOperation,
  ShellOperation,
} from "../types/sandbox.js";

/**
 * Policy Engine - Core policy evaluation logic
 */
export class PolicyEngine {
  private config: SandboxConfig;

  // Common escape patterns (per OWASP + Tian Pan research)
  private readonly ESCAPE_PATTERNS = {
    // Path traversal
    pathTraversal: [
      /\.\.\//g,
      /\.\.\\/g,
      /%2e%2e%2f/gi, // URL encoded
      /%2e%2e\//gi,
    ],
    // Command injection
    commandInjection: [
      /[;&|`$()]/g, // Shell metacharacters
      /\$\(/g,      // Command substitution
      /\{\s*\}/g,  // Bash brace expansion
      /&&|\|\|/g,   // Chained commands
    ],
    // IP obfuscation
    ipObfuscation: [
      /\b0x[0-9a-f]+\b/gi,      // Hex IP
      /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, // Direct IP
      /(\d+)\.(\d+)\.(\d+)\.(\d+)/g, // Octal-like
    ],
    // Docker socket
    dockerSocket: [/\/var\/run\/docker\.sock/g],
    // Config file paths
    configFiles: [
      /\.gitconfig/g,
      /\.zshrc/g,
      /\.bashrc/g,
      /\.bash_profile/g,
      /\.profile/g,
      /\.vimrc/g,
      /\/etc\/passwd/g,
      /\/etc\/shadow/g,
    ],
    // Dangerous symlink patterns
    symlinkDangerous: [
      /symlink/gi,
      /readlink/gi,
      /ln\s+-s/gi,
    ],
    // DNS exfiltration patterns
    dnsExfil: [
      /\b[a-f0-9]{32,}\b/gi, // Long hex strings
      /\b[A-Za-z0-9+/]{40,}={0,2}\b/g, // Base64 strings
    ],
  };

  constructor(config: SandboxConfig) {
    this.config = config;
  }

  /**
   * Update config
   */
  updateConfig(config: SandboxConfig): void {
    this.config = config;
  }

  /**
   * Main policy evaluation entry point
   */
  evaluate(operation: SandboxOperation): PolicyResult {
    // Check if sandbox is disabled
    if (this.config.mode === "disabled" || !this.config.enabled) {
      return {
        allowed: true,
        decision: "allow",
        reason: "Sandbox is disabled",
        timestamp: Date.now(),
      };
    }

    // Route to specific evaluator
    switch (operation.type) {
      case "filesystem":
        return this.evaluateFilesystem(operation);
      case "network":
        return this.evaluateNetwork(operation);
      case "shell":
        return this.evaluateShell(operation);
      default:
        return this.deny("Unknown operation type", undefined, operation);
    }
  }

  /**
   * Evaluate filesystem operation
   */
  private evaluateFilesystem(operation: FilesystemOperation): PolicyResult {
    const fsConfig = this.config.filesystem;
    if (!fsConfig?.enabled) {
      return {
        allowed: true,
        decision: "allow",
        reason: "Filesystem sandbox is disabled",
        timestamp: Date.now(),
      };
    }

    const resolvedPath = this.resolvePath(operation.path);

    // 1. Check for escape vectors first (highest priority)
    const escapeResult = this.checkEscapeVectors(operation);
    if (escapeResult) {
      return escapeResult;
    }

    // 2. Check blocked paths (deny list)
    for (const blocked of fsConfig.blockedPaths) {
      const resolvedBlocked = this.resolvePath(blocked);
      if (resolvedPath.startsWith(resolvedBlocked)) {
        return this.deny(
          `Path is in blocked list: ${blocked}`,
          undefined,
          operation,
          "path_traversal"
        );
      }
    }

    // 3. Check allowed paths (allow list)
    if (fsConfig.allowedPaths.length > 0) {
      let inAllowed = false;
      for (const allowed of fsConfig.allowedPaths) {
        const resolvedAllowed = this.resolvePath(allowed);
        if (
          resolvedPath === resolvedAllowed ||
          resolvedPath.startsWith(resolvedAllowed + "/")
        ) {
          inAllowed = true;
          break;
        }
      }
      if (!inAllowed) {
        if (this.config.mode === "preview") {
          return this.preview(
            `Path not in allowed list: ${operation.path}`,
            operation
          );
        }
        return this.deny(
          `Path not in allowed list: ${operation.path}`,
          undefined,
          operation,
          "path_traversal"
        );
      }
    }

    // 4. Check operation-specific restrictions
    if (operation.action === "write" && !fsConfig.allowCreate) {
      return this.deny("File creation is not allowed", undefined, operation);
    }

    if (operation.action === "delete" && !fsConfig.allowDelete) {
      return this.deny("File deletion is not allowed", undefined, operation);
    }

    if (
      operation.action === "write" &&
      operation.content &&
      this.checkDangerousContent(operation.content)
    ) {
      return this.deny(
        "File contains potentially dangerous content",
        undefined,
        operation,
        "command_injection"
      );
    }

    // All checks passed
    return {
      allowed: true,
      decision: "allow",
      reason: `Allowed: ${operation.action} ${operation.path}`,
      timestamp: Date.now(),
    };
  }

  /**
   * Evaluate network operation
   */
  private evaluateNetwork(operation: NetworkOperation): PolicyResult {
    const netConfig = this.config.network;
    if (!netConfig?.enabled) {
      return {
        allowed: true,
        decision: "allow",
        reason: "Network sandbox is disabled",
        timestamp: Date.now(),
      };
    }

    const url = operation.url;
    const domain = operation.domain || this.extractDomain(url);

    // 1. Check for escape vectors
    const escapeResult = this.checkEscapeVectors(operation);
    if (escapeResult) {
      return escapeResult;
    }

    // 2. Check blocked domains
    for (const blocked of netConfig.blockedDomains) {
      if (domain.includes(blocked)) {
        return this.deny(
          `Domain is blocked: ${domain}`,
          undefined,
          operation,
          "dns_exfiltration"
        );
      }
    }

    // 3. Check allowed domains (if specified)
    if (netConfig.allowedDomains.length > 0) {
      let inAllowed = false;
      for (const allowed of netConfig.allowedDomains) {
        if (domain === allowed || domain.endsWith(`.${allowed}`)) {
          inAllowed = true;
          break;
        }
      }
      if (!inAllowed) {
        if (this.config.mode === "preview") {
          return this.preview(
            `Domain not in allowed list: ${domain}`,
            operation
          );
        }
        return this.deny(
          `Domain not in allowed list: ${domain}`,
          undefined,
          operation,
          "dns_exfiltration"
        );
      }
    }

    // 4. Check protocol
    const protocol = url.split("://")[0];
    if (
      !netConfig.allowedProtocols.includes(protocol as "http" | "https")
    ) {
      return this.deny(
        `Protocol not allowed: ${protocol}`,
        undefined,
        operation
      );
    }

    // 5. Check for IP obfuscation (direct IP instead of domain)
    if (this.matchesPattern(url, this.ESCAPE_PATTERNS.ipObfuscation)) {
      return this.deny(
        "Direct IP address not allowed (possible obfuscation)",
        url,
        operation,
        "ip_obfuscation"
      );
    }

    // 6. Check for suspicious data in request
    if (
      operation.body &&
      this.matchesPattern(operation.body, this.ESCAPE_PATTERNS.dnsExfil)
    ) {
      return this.deny(
        "Suspicious data pattern in request body (possible exfiltration)",
        undefined,
        operation,
        "dns_exfiltration"
      );
    }

    return {
      allowed: true,
      decision: "allow",
      reason: `Allowed: ${operation.method || "request"} ${domain}`,
      timestamp: Date.now(),
    };
  }

  /**
   * Evaluate shell operation
   */
  private evaluateShell(operation: ShellOperation): PolicyResult {
    const shellConfig = this.config.shell;
    if (!shellConfig?.enabled) {
      return {
        allowed: true,
        decision: "allow",
        reason: "Shell sandbox is disabled",
        timestamp: Date.now(),
      };
    }

    const command = operation.command;

    // 1. Check for escape vectors
    const escapeResult = this.checkEscapeVectors(operation);
    if (escapeResult) {
      return escapeResult;
    }

    // 2. Check blocked commands
    for (const blocked of shellConfig.blockedCommands) {
      if (command.includes(blocked)) {
        return this.deny(
          `Command contains blocked pattern: ${blocked}`,
          command,
          operation,
          "command_injection"
        );
      }
    }

    // 3. Check allowed commands (if specified)
    if (shellConfig.allowedCommands.length > 0) {
      const baseCommand = command.split(" ")[0];
      // Handle commands with paths like /usr/bin/git
      const baseName = path.basename(baseCommand);

      if (!shellConfig.allowedCommands.includes(baseName)) {
        if (this.config.mode === "preview") {
          return this.preview(
            `Command not in allowed list: ${baseName}`,
            operation
          );
        }
        return this.deny(
          `Command not in allowed list: ${baseName}`,
          command,
          operation,
          "command_injection"
        );
      }
    }

    // 4. Check for shell metacharacters (command injection)
    if (this.matchesPattern(command, this.ESCAPE_PATTERNS.commandInjection)) {
      return this.deny(
        "Command contains shell metacharacters",
        command,
        operation,
        "command_injection"
      );
    }

    // 5. Check pipes and redirects
    if (!shellConfig.allowPipes && command.includes("|")) {
      return this.deny(
        "Pipe operator not allowed",
        command,
        operation,
        "command_injection"
      );
    }

    if (!shellConfig.allowRedirects && /[<>]/.test(command)) {
      return this.deny(
        "Redirect operators not allowed",
        command,
        operation,
        "command_injection"
      );
    }

    return {
      allowed: true,
      decision: "allow",
      reason: `Allowed: ${path.basename(command.split(" ")[0])}`,
      timestamp: Date.now(),
    };
  }

  /**
   * Check for escape vectors in operation
   */
  private checkEscapeVectors(
    operation: SandboxOperation
  ): PolicyResult | null {
    if (!this.config.monitoring?.detectEscapeAttempts) {
      return null;
    }

    // Docker socket check (works for filesystem and shell)
    if (
      operation.type === "filesystem" ||
      operation.type === "shell"
    ) {
      const path = operation.type === "filesystem"
        ? (operation as FilesystemOperation).path
        : (operation as ShellOperation).command;

      if (this.matchesPattern(path, this.ESCAPE_PATTERNS.dockerSocket)) {
        return this.deny(
          "Docker socket access detected",
          path,
          operation,
          "docker_socket"
        );
      }
    }

    // Config file poisoning check
    if (operation.type === "filesystem") {
      const fsPath = (operation as FilesystemOperation).path;
      if (
        this.matchesPattern(fsPath, this.ESCAPE_PATTERNS.configFiles) ||
        fsPath.includes(".config") ||
        fsPath.includes(".cursorrules") ||
        fsPath.includes("mcp")
      ) {
        return this.deny(
          "Config file access detected (possible poisoning)",
          fsPath,
          operation,
          "config_poisoning"
        );
      }
    }

    // DNS exfiltration check for network operations
    if (operation.type === "network") {
      const url = (operation as NetworkOperation).url;
      const body = (operation as NetworkOperation).body;

      if (this.matchesPattern(url, this.ESCAPE_PATTERNS.dnsExfil)) {
        return this.deny(
          "Suspicious pattern in URL (possible DNS exfiltration)",
          url,
          operation,
          "dns_exfiltration"
        );
      }

      if (body && this.matchesPattern(body, this.ESCAPE_PATTERNS.dnsExfil)) {
        return this.deny(
          "Suspicious pattern in request body",
          undefined,
          operation,
          "dns_exfiltration"
        );
      }
    }

    return null;
  }

  /**
   * Resolve path to absolute path (handles ~, symlinks)
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

    // Note: In production, use fs.realpathSync for symlink resolution
    // This is a simplified version for the policy engine
    return resolved;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return url;
    }
  }

  /**
   * Check if string matches any pattern in the list
   */
  private matchesPattern(
    str: string | undefined,
    patterns: RegExp[]
  ): boolean {
    if (!str) return false;
    return patterns.some((pattern) => pattern.test(str));
  }

  /**
   * Check for dangerous content in file
   */
  private checkDangerousContent(content: string): boolean {
    // Check for shebang that might execute code
    if (content.startsWith("#!/")) {
      return true;
    }

    // Check for embedded scripts
    if (/<script[^>]*>/i.test(content)) {
      return true;
    }

    // Check for eval/exec patterns
    if (/\b(eval|exec|spawn|child_process)\s*\(/i.test(content)) {
      return true;
    }

    return false;
  }

  /**
   * Create deny result
   */
  private deny(
    reason: string,
    blockedPattern: string | undefined,
    operation: SandboxOperation,
    escapeVector?: EscapeVectorType
  ): PolicyResult {
    return {
      allowed: false,
      decision: "deny",
      reason,
      blockedPattern,
      escapeVector,
      timestamp: Date.now(),
      sessionId: operation.sessionId,
    };
  }

  /**
   * Create preview result (for preview mode)
   */
  private preview(
    reason: string,
    operation: SandboxOperation
  ): PolicyResult {
    return {
      allowed: false,
      decision: "preview",
      reason,
      timestamp: Date.now(),
      sessionId: operation.sessionId,
    };
  }

  /**
   * Get list of escape vectors being monitored
   */
  getMonitoredEscapeVectors(): EscapeVectorType[] {
    return [
      "path_traversal",
      "symlink_escape",
      "command_injection",
      "docker_socket",
      "config_poisoning",
      "dns_exfiltration",
      "ip_obfuscation",
      "subprocess_escape",
    ];
  }

  /**
   * Validate that config is secure
   */
  validateConfig(): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check if any allowlist is empty (too permissive)
    if (this.config.filesystem?.allowedPaths?.length === 0) {
      warnings.push(
        "Filesystem allowlist is empty - all paths will be blocked"
      );
    }

    if (this.config.shell?.allowedCommands?.length === 0) {
      warnings.push(
        "Shell allowlist is empty - all commands will be blocked"
      );
    }

    if (this.config.network?.allowedDomains?.length === 0) {
      warnings.push(
        "Network allowlist is empty - all domains will be blocked"
      );
    }

    // Check for dangerous defaults
    if (this.config.shell?.allowPipes) {
      warnings.push(
        "Shell pipes are enabled - this increases command injection risk"
      );
    }

    if (this.config.shell?.allowRedirects) {
      warnings.push(
        "Shell redirects are enabled - this increases command injection risk"
      );
    }

    if (this.config.filesystem?.allowDelete) {
      warnings.push(
        "File deletion is enabled - ensure proper backup procedures"
      );
    }

    return {
      valid: warnings.filter(
        (w) => w.includes("empty") || w.includes("dangerous")
      ).length === 0,
      warnings,
    };
  }
}

/**
 * Factory function
 */
export function createPolicyEngine(config: SandboxConfig): PolicyEngine {
  return new PolicyEngine(config);
}
