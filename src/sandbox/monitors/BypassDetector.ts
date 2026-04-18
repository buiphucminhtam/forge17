/**
 * Bypass Detector - Detects and tracks sandbox escape attempts
 *
 * Based on research from:
 * - Tian Pan (2026) - Agent Sandboxing: Escape vectors
 * - OWASP LLM Security - Common bypass patterns
 */

import {
  EscapeVectorType,
  SandboxOperation,
} from "../types/sandbox.js";

interface EscapeAttempt {
  type: EscapeVectorType;
  timestamp: number;
  operation: SandboxOperation;
  blocked: boolean;
}

interface BypassPattern {
  vector: EscapeVectorType;
  patterns: RegExp[];
  severity: "critical" | "high" | "medium";
  description: string;
}

/**
 * Bypass Detector - Monitors for common escape patterns
 */
export class BypassDetector {
  private attempts: EscapeAttempt[] = [];
  private readonly MAX_ATTEMPTS = 1000;
  private readonly SUSPICIOUS_THRESHOLD = 5; // Block after 5 attempts

  // Common bypass patterns (per OWASP + Tian Pan research)
  private readonly BYPASS_PATTERNS: BypassPattern[] = [
    {
      vector: "path_traversal",
      patterns: [
        /\.\.\//g,
        /\.\.\\/g,
        /%2e%2e%2f/gi,
        /%2e%2e\//gi,
        /\.\.%2f/gi,
      ],
      severity: "critical",
      description: "Directory traversal using ../",
    },
    {
      vector: "symlink_escape",
      patterns: [
        /symlink/gi,
        /readlink/gi,
        /ln\s+-[sf]/gi,
        /createSymbolicLink/gi,
      ],
      severity: "high",
      description: "Symlink manipulation detected",
    },
    {
      vector: "command_injection",
      patterns: [
        /[;&|`$()]/g,
        /\$\(/g,
        /`[^`]+`/g,
        /&&|\|\|/g,
        /\{\s*.*\s*\}/g,
        /\beval\s*\(/gi,
        /\bexec\s*\(/gi,
        /\bspawn\s*\(/gi,
        /\bchild_process/gi,
      ],
      severity: "critical",
      description: "Shell metacharacters or dangerous function calls",
    },
    {
      vector: "docker_socket",
      patterns: [
        /docker\.sock/,
        /\/var\/run\//,
        /docker:\/\//,
        /docker\s+(ps|exec|run)/i,
      ],
      severity: "critical",
      description: "Docker socket access detected",
    },
    {
      vector: "config_poisoning",
      patterns: [
        /\.gitconfig/,
        /\.zshrc/,
        /\.bashrc/,
        /\.bash_profile/,
        /\.profile/,
        /\.vimrc/,
        /\.cursorrules/,
        /\.claude/,
        /\/etc\/passwd/,
        /\/etc\/shadow/,
        /mcp.*\.json/,
        /agent.*config/,
      ],
      severity: "critical",
      description: "Configuration file access detected (persistence vector)",
    },
    {
      vector: "dns_exfiltration",
      patterns: [
        /\b[a-z0-9]{32,}\b/gi, // Long alphanumeric strings (potential encoded data)
        /\b[A-Za-z0-9+/]{40,}={0,2}\b/g, // Base64 strings
        /\b(secret|token|key|password)=/gi,
      ],
      severity: "high",
      description: "Potential data exfiltration pattern",
    },
    {
      vector: "ip_obfuscation",
      patterns: [
        /\b0x[0-9a-f]+\b/gi, // Hex IP
        /\b(\d{1,3}\.){3}\d{1,3}\b/, // Direct IP
        /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/g,
      ],
      severity: "medium",
      description: "IP address obfuscation detected",
    },
    {
      vector: "kernel_cve",
      patterns: [
        /unshare/gi,
        /ptrace/gi,
        /keyctl/gi,
        /perf_event_open/gi,
        /bpf\s*\(/gi,
        /modprobe/gi,
        /insmod/gi,
      ],
      severity: "critical",
      description: "Potential kernel exploit syscall detected",
    },
    {
      vector: "conversation_injection",
      patterns: [
        /ignore\s+(previous|above|all)/gi,
        /forget\s+(everything|instructions)/gi,
        /\bSYSTEM\s*:/gim,
        /\bINSTRUCTIONS?\s*:/gim,
        /<\s*script/gi,
        /```system/gi,
      ],
      severity: "high",
      description: "Prompt injection pattern detected",
    },
    {
      vector: "subprocess_escape",
      patterns: [
        /child_process/gi,
        /spawn\s*\(/gi,
        /exec\s*\(/gi,
        /fork\s*\(/gi,
        /__import__\s*\(\s*["']os["']\s*\)/gi,
        /os\.system/gi,
        /os\.popen/gi,
        /subprocess/gi,
      ],
      severity: "high",
      description: "Subprocess spawning detected",
    },
  ];

  constructor() {
    // Initialize
  }

  /**
   * Record an escape attempt
   */
  recordEscapeAttempt(
    type: EscapeVectorType,
    operation: SandboxOperation
  ): void {
    this.attempts.push({
      type,
      timestamp: Date.now(),
      operation,
      blocked: true, // If we recorded it, we blocked it
    });

    // Trim old attempts
    if (this.attempts.length > this.MAX_ATTEMPTS) {
      this.attempts = this.attempts.slice(-this.MAX_ATTEMPTS);
    }
  }

  /**
   * Check if content contains bypass patterns
   */
  detect(
    content: string,
    operationType: "filesystem" | "network" | "shell"
  ): {
    detected: boolean;
    patterns: Array<{
      type: EscapeVectorType;
      pattern: string;
      severity: string;
      description: string;
    }>;
  } {
    const detected: Array<{
      type: EscapeVectorType;
      pattern: string;
      severity: string;
      description: string;
    }> = [];

    // Select relevant patterns based on operation type
    const relevantPatterns = this.BYPASS_PATTERNS.filter((p) => {
      switch (operationType) {
        case "filesystem":
          return [
            "path_traversal",
            "symlink_escape",
            "docker_socket",
            "config_poisoning",
            "kernel_cve",
            "conversation_injection",
          ].includes(p.vector);
        case "network":
          return [
            "dns_exfiltration",
            "ip_obfuscation",
            "command_injection",
            "conversation_injection",
          ].includes(p.vector);
        case "shell":
          return [
            "command_injection",
            "docker_socket",
            "kernel_cve",
            "subprocess_escape",
          ].includes(p.vector);
        default:
          return true;
      }
    });

    // Check each pattern
    for (const bp of relevantPatterns) {
      for (const pattern of bp.patterns) {
        if (pattern.test(content)) {
          detected.push({
            type: bp.vector,
            pattern: pattern.source,
            severity: bp.severity,
            description: bp.description,
          });
          // Reset lastIndex for global patterns
          pattern.lastIndex = 0;
        }
      }
    }

    return {
      detected: detected.length > 0,
      patterns: detected,
    };
  }

  /**
   * Get current status
   */
  getStatus(): {
    totalAttempts: number;
    recentAttempts: Array<{
      type: string;
      timestamp: number;
      operation: string;
    }>;
    byType: Record<string, number>;
    blocked: boolean;
    blockedReason?: string;
  } {
    const now = Date.now();
    const recentThreshold = 60 * 60 * 1000; // Last hour

    // Count attempts by type
    const byType: Record<string, number> = {};
    const recent: EscapeAttempt[] = [];

    for (const attempt of this.attempts) {
      const type = attempt.type;
      byType[type] = (byType[type] || 0) + 1;

      // Track recent attempts
      if (now - attempt.timestamp < recentThreshold) {
        recent.push(attempt);
      }
    }

    // Check if we should block
    const recentCount = recent.length;
    let blocked = false;
    let blockedReason: string | undefined;

    if (recentCount >= this.SUSPICIOUS_THRESHOLD) {
      blocked = true;
      blockedReason = `Too many escape attempts: ${recentCount} in the last hour`;
    }

    return {
      totalAttempts: this.attempts.length,
      recentAttempts: recent.map((a) => ({
        type: a.type,
        timestamp: a.timestamp,
        operation: `${a.operation.type}: ${JSON.stringify(a.operation).slice(0, 100)}`,
      })),
      byType,
      blocked,
      blockedReason,
    };
  }

  /**
   * Get escape attempt statistics
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    lastAttempt?: {
      type: string;
      timestamp: number;
    };
  } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const attempt of this.attempts) {
      byType[attempt.type] = (byType[attempt.type] || 0) + 1;

      const bp = this.BYPASS_PATTERNS.find((p) => p.vector === attempt.type);
      if (bp) {
        bySeverity[bp.severity] = (bySeverity[bp.severity] || 0) + 1;
      }
    }

    const lastAttempt = this.attempts[this.attempts.length - 1];

    return {
      total: this.attempts.length,
      byType,
      bySeverity,
      lastAttempt: lastAttempt
        ? {
            type: lastAttempt.type,
            timestamp: lastAttempt.timestamp,
          }
        : undefined,
    };
  }

  /**
   * Get list of all monitored patterns
   */
  getMonitoredPatterns(): BypassPattern[] {
    return this.BYPASS_PATTERNS;
  }

  /**
   * Clear recorded attempts (for testing)
   */
  clear(): void {
    this.attempts = [];
  }

  /**
   * Add custom bypass pattern
   */
  addPattern(pattern: BypassPattern): void {
    this.BYPASS_PATTERNS.push(pattern);
  }

  /**
   * Remove bypass pattern by vector type
   */
  removePattern(vector: EscapeVectorType): void {
    const index = this.BYPASS_PATTERNS.findIndex((p) => p.vector === vector);
    if (index !== -1) {
      this.BYPASS_PATTERNS.splice(index, 1);
    }
  }
}

/**
 * Factory function
 */
export function createBypassDetector(): BypassDetector {
  return new BypassDetector();
}
