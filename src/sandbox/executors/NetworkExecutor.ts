/**
 * Network Executor - Sandboxed network operations
 *
 * Implements safe network operations based on policy engine decisions.
 * Blocks DNS exfiltration, IP obfuscation, and unauthorized domains.
 */

import { NetworkConfig, NetworkOperation, PolicyResult } from "../types/sandbox.js";
import { PolicyEngine } from "../manager/PolicyEngine.js";

export interface NetworkResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  url: string;
  timing: {
    start: number;
    end: number;
    duration: number;
  };
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

/**
 * Network Executor - Performs sandboxed network operations
 */
export class NetworkExecutor {
  private config: NetworkConfig;
  private policyEngine: PolicyEngine;
  private requestLog: Array<{
    url: string;
    method: string;
    timestamp: number;
    status?: number;
    blocked?: boolean;
  }>;

  constructor(config: NetworkConfig, policyEngine: PolicyEngine) {
    this.config = config;
    this.policyEngine = policyEngine;
    this.requestLog = [];
  }

  /**
   * Update config
   */
  updateConfig(config: NetworkConfig): void {
    this.config = config;
  }

  /**
   * Execute a network request
   */
  async execute(operation: NetworkOperation): Promise<{
    success: boolean;
    result?: NetworkResponse;
    error?: string;
    policyResult: PolicyResult;
  }> {
    // Evaluate policy
    const policyResult = this.policyEngine.evaluate(operation);

    if (!policyResult.allowed) {
      this.logRequest(operation, undefined, true);
      return {
        success: false,
        error: policyResult.reason,
        policyResult,
      };
    }

    if (policyResult.decision === "preview") {
      return {
        success: false,
        error: "Preview mode: request requires confirmation",
        policyResult,
      };
    }

    // Execute the request
    try {
      const response = await this.makeRequest(operation);
      this.logRequest(operation, response.status, false);
      return {
        success: true,
        result: response,
        policyResult,
      };
    } catch (error) {
      this.logRequest(operation, undefined, true);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        policyResult,
      };
    }
  }

  /**
   * Make an HTTP request
   */
  async makeRequest(operation: NetworkOperation): Promise<NetworkResponse> {
    const startTime = Date.now();
    const timeout = (this.config.timeout || 30) * 1000;
    const maxResponseSize = this.parseSize(this.config.maxResponseSize || "5MB");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(operation.url, {
        method: operation.method || "GET",
        headers: {
          "User-Agent": "Forgewright-Sandbox/1.0",
          ...operation.headers,
        },
        body: operation.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Read response body
      const body = await response.text();

      // Check response size
      if (Buffer.byteLength(body, "utf-8") > maxResponseSize) {
        throw new Error(
          `Response size ${body.length} exceeds limit ${maxResponseSize}`
        );
      }

      const endTime = Date.now();

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body,
        url: operation.url,
        timing: {
          start: startTime,
          end: endTime,
          duration: endTime - startTime,
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${timeout / 1000}s`);
        }
        throw error;
      }

      throw new Error("Unknown network error");
    }
  }

  /**
   * Check if a domain is allowed
   */
  isDomainAllowed(domain: string): boolean {
    // Check blocked domains first
    for (const blocked of this.config.blockedDomains || []) {
      if (domain.includes(blocked)) {
        return false;
      }
    }

    // Check allowed domains
    if (this.config.allowedDomains && this.config.allowedDomains.length > 0) {
      for (const allowed of this.config.allowedDomains) {
        if (domain === allowed || domain.endsWith(`.${allowed}`)) {
          return true;
        }
      }
      return false;
    }

    // No restrictions
    return true;
  }

  /**
   * Parse URL and extract domain
   */
  extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return url;
    }
  }

  /**
   * Get request log
   */
  getRequestLog(): Array<{
    url: string;
    method: string;
    timestamp: number;
    status?: number;
    blocked?: boolean;
  }> {
    return [...this.requestLog];
  }

  /**
   * Clear request log
   */
  clearRequestLog(): void {
    this.requestLog = [];
  }

  /**
   * Log a request
   */
  private logRequest(
    operation: NetworkOperation,
    status: number | undefined,
    blocked: boolean
  ): void {
    if (this.config.logAllRequests) {
      this.requestLog.push({
        url: operation.url,
        method: operation.method || "GET",
        timestamp: Date.now(),
        status,
        blocked,
      });

      // Trim log if too large
      if (this.requestLog.length > 10000) {
        this.requestLog = this.requestLog.slice(-5000);
      }
    }
  }

  /**
   * Parse size string (e.g., "5MB") to bytes
   */
  private parseSize(size: string): number {
    const match = size.match(/^(\d+)([KMG]?B?)$/i);
    if (!match) {
      return 5 * 1024 * 1024; // Default 5MB
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
}

/**
 * Factory function
 */
export function createNetworkExecutor(
  config: NetworkConfig,
  policyEngine: PolicyEngine
): NetworkExecutor {
  return new NetworkExecutor(config, policyEngine);
}
