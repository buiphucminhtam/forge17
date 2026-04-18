/**
 * Audit Logger - Records all sandbox operations for security analysis
 *
 * Writes audit logs to JSONL format for efficient storage and querying
 */

import fs from "fs";
import path from "path";
import {
  SandboxConfig,
  AuditLogEntry,
  SandboxOperation,
  PolicyResult,
} from "../types/sandbox.js";

/**
 * Audit Logger - Writes all sandbox operations to persistent log
 */
export class AuditLogger {
  private config: SandboxConfig;
  private logStream: fs.WriteStream | null = null;
  private memoryBuffer: AuditLogEntry[] = [];
  private readonly MAX_MEMORY_BUFFER = 1000;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds

  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(config: SandboxConfig) {
    this.config = config;
    if (config.monitoring?.enabled && config.monitoring?.logAllOperations) {
      this.initialize();
    }
  }

  /**
   * Initialize the audit logger
   */
  initialize(): void {
    if (this.isInitialized) return;

    const auditPath = this.config.monitoring?.auditPath || ".forgewright/sandbox-audit.jsonl";

    try {
      // Ensure directory exists
      const dir = path.dirname(auditPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Open append stream
      this.logStream = fs.createWriteStream(auditPath, {
        flags: "a",
        encoding: "utf-8",
      });

      // Handle errors
      this.logStream.on("error", (error) => {
        console.error("Audit log write error:", error);
      });

      // Set up periodic flush
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.FLUSH_INTERVAL);

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize audit logger:", error);
    }
  }

  /**
   * Log an audit entry
   */
  log(entry: AuditLogEntry): void {
    // Always buffer in memory
    this.memoryBuffer.push(entry);

    // Trim buffer if too large
    if (this.memoryBuffer.length > this.MAX_MEMORY_BUFFER) {
      this.memoryBuffer.shift();
    }

    // Write to disk if enabled
    if (this.logStream && this.config.monitoring?.logAllOperations) {
      this.logStream.write(JSON.stringify(entry) + "\n");
    }

    // Log escape attempts
    if (entry.result.escapeVector) {
      this.logEscapeAttempt(entry);
    }
  }

  /**
   * Log escape attempt with extra visibility
   */
  private logEscapeAttempt(entry: AuditLogEntry): void {
    const message = [
      `🚨 ESCAPE ATTEMPT DETECTED`,
      `  ID: ${entry.id}`,
      `  Type: ${entry.result.escapeVector}`,
      `  Operation: ${entry.operation.type}`,
      `  Reason: ${entry.result.reason}`,
      `  Timestamp: ${new Date(entry.timestamp).toISOString()}`,
      `  Session: ${entry.sessionId || "unknown"}`,
    ].join("\n");

    // Always log to console for escape attempts
    console.warn(message);

    // Alert if configured
    if (this.config.monitoring?.alertOnBypass) {
      this.triggerAlert(entry);
    }
  }

  /**
   * Trigger alert for bypass attempt
   */
  private triggerAlert(entry: AuditLogEntry): void {
    const alert = {
      type: "sandbox_bypass_attempt",
      severity: "HIGH",
      timestamp: Date.now(),
      entry: entry,
      message: `Sandbox bypass attempt detected: ${entry.result.escapeVector}`,
    };

    // Log alert to stderr (for monitoring systems to capture)
    console.error(JSON.stringify(alert));

    // In production, this would:
    // 1. Send to SIEM (Splunk, Elastic, etc.)
    // 2. Send to Slack/Teams webhook
    // 3. Create incident ticket
    // For now, we just log to stderr
  }

  /**
   * Flush memory buffer to disk
   */
  private flush(): void {
    if (!this.logStream || this.memoryBuffer.length === 0) return;

    try {
      for (const entry of this.memoryBuffer) {
        this.logStream.write(JSON.stringify(entry) + "\n");
      }
      this.memoryBuffer = [];
    } catch (error) {
      console.error("Audit log flush error:", error);
    }
  }

  /**
   * Get recent audit entries from memory
   */
  getEntries(limit?: number): AuditLogEntry[] {
    if (limit) {
      return this.memoryBuffer.slice(-limit);
    }
    return [...this.memoryBuffer];
  }

  /**
   * Query audit log from disk
   */
  query(filter?: {
    sessionId?: string;
    operationType?: string;
    allowed?: boolean;
    escapeVector?: string;
    startTime?: number;
    endTime?: number;
  }): AuditLogEntry[] {
    const results: AuditLogEntry[] = [];
    const auditPath = this.config.monitoring?.auditPath || ".forgewright/sandbox-audit.jsonl";

    try {
      if (!fs.existsSync(auditPath)) {
        return results;
      }

      const content = fs.readFileSync(auditPath, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const entry: AuditLogEntry = JSON.parse(line);

          // Apply filters
          if (filter) {
            if (filter.sessionId && entry.sessionId !== filter.sessionId) continue;
            if (filter.operationType && entry.operation.type !== filter.operationType) continue;
            if (filter.allowed !== undefined && entry.result.allowed !== filter.allowed) continue;
            if (filter.escapeVector && entry.result.escapeVector !== filter.escapeVector) continue;
            if (filter.startTime && entry.timestamp < filter.startTime) continue;
            if (filter.endTime && entry.timestamp > filter.endTime) continue;
          }

          results.push(entry);
        } catch {
          // Skip invalid lines
        }
      }
    } catch (error) {
      console.error("Failed to query audit log:", error);
    }

    return results;
  }

  /**
   * Get escape attempt statistics
   */
  getEscapeStats(): {
    total: number;
    byType: Record<string, number>;
    recent: AuditLogEntry[];
  } {
    const entries = this.query({ allowed: false });
    const escapeEntries = entries.filter((e) => e.result.escapeVector);

    const byType: Record<string, number> = {};
    for (const entry of escapeEntries) {
      const type = entry.result.escapeVector || "unknown";
      byType[type] = (byType[type] || 0) + 1;
    }

    return {
      total: escapeEntries.length,
      byType,
      recent: escapeEntries.slice(-10),
    };
  }

  /**
   * Close and cleanup
   */
  close(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    this.flush();

    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }

    this.isInitialized = false;
  }

  /**
   * Update config
   */
  updateConfig(config: SandboxConfig): void {
    const wasEnabled = this.config.monitoring?.enabled;
    this.config = config;

    if (config.monitoring?.enabled && config.monitoring?.logAllOperations) {
      if (!wasEnabled) {
        this.initialize();
      }
    } else {
      this.close();
    }
  }
}

/**
 * Factory function
 */
export function createAuditLogger(config: SandboxConfig): AuditLogger {
  return new AuditLogger(config);
}
