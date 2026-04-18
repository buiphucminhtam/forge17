/**
 * Sandbox Types - TypeScript interfaces for sandbox configuration and operations
 *
 * Based on research from:
 * - Tian Pan (2026) - Agent Sandboxing: 5-level isolation spectrum
 * - OWASP LLM Security - Prompt injection, escaping vectors
 * - e2b/Firecracker - Production sandbox patterns
 */

import { z } from 'zod';

// =============================================================================
// Isolation Levels (per Tian Pan's isolation spectrum)
// =============================================================================

const IsolationLevelSchema = z.enum([
  "none",      // L0: Direct exec, no isolation
  "container",  // L1: Docker/LXC containers
  "seccomp",   // L2: seccomp-BPF hardened
  "gvisor",    // L3: gVisor user-space kernel
  "microvm",   // L4: Firecracker microVM (gold standard)
]);
export type IsolationLevel = z.infer<typeof IsolationLevelSchema>;

// =============================================================================
// Isolation Configuration
// =============================================================================

export const IsolationConfigSchema = z.object({
  level: IsolationLevelSchema,
  fallback: z.enum(["gvisor", "seccomp", "container", "none"]).optional(),
  // Firecracker (L4) config
  microvm: z.object({
    enabled: z.boolean().default(false),
    snapshotRestore: z.boolean().default(true),
    memoryOverheadMb: z.number().default(5),
    bootTimeMs: z.number().default(125),
    snapshotPath: z.string().optional(),
  }).optional(),
  // gVisor (L3) config
  gvisor: z.object({
    enabled: z.boolean().default(false),
    runscPath: z.string().default("/usr/bin/runsc"),
    gpuSupport: z.boolean().default(false),
  }).optional(),
  // seccomp (L2) config
  seccomp: z.object({
    enabled: z.boolean().default(true),
    profile: z.enum(["default", "strict", "ai-agent"]).default("ai-agent"),
    blockedSyscalls: z.array(z.string()).optional(),
  }).optional(),
});
export type IsolationConfig = z.infer<typeof IsolationConfigSchema>;

// =============================================================================
// Filesystem Sandbox
// =============================================================================

export const FilesystemConfigSchema = z.object({
  enabled: z.boolean().default(true),
  // Path allowlist - only these paths are accessible
  allowedPaths: z.array(z.string()).default(["./src", "./tests"]),
  // Path blocklist - never accessible regardless of allowlist
  blockedPaths: z.array(z.string()).default([
    "~/.ssh",
    "~/.gitconfig",
    "~/.zshrc",
    "~/.bashrc",
    "/etc",
    "/var",
    "/root",
    "/sys",
    "/proc",
  ]),
  // File operation restrictions
  maxFileSize: z.string().default("10MB"),
  allowCreate: z.boolean().default(true),
  allowDelete: z.boolean().default(false),
  allowSymlink: z.boolean().default(false),
  // Real path resolution (prevents symlink bypass)
  resolveRealPath: z.boolean().default(true),
  // Read-only root filesystem
  readOnlyRoot: z.boolean().default(true),
  // Workspace directory (tmpfs)
  workspaceDir: z.string().default("/tmp/forge-sandbox"),
});
export type FilesystemConfig = z.infer<typeof FilesystemConfigSchema>;

// =============================================================================
// Network Sandbox
// =============================================================================

export const NetworkConfigSchema = z.object({
  enabled: z.boolean().default(true),
  // Domain allowlist - only these domains are accessible
  allowedDomains: z.array(z.string()).default([
    "api.github.com",
    "pypi.org",
    "npmjs.com",
    "registry.npmjs.org",
  ]),
  // Domain blocklist - never accessible
  blockedDomains: z.array(z.string()).default([
    "internal.corp.com",
    "localhost",
    "127.0.0.1",
  ]),
  // Protocol restrictions
  allowedProtocols: z.array(z.enum(["http", "https"])).default(["https"]),
  // DNS security
  blockDns: z.boolean().default(true),
  allowDnsResolution: z.boolean().default(false),
  allowedDnsServers: z.array(z.string()).optional(),
  // Request restrictions
  timeout: z.number().default(30), // seconds
  maxResponseSize: z.string().default("5MB"),
  // Egress monitoring
  logAllRequests: z.boolean().default(true),
});
export type NetworkConfig = z.infer<typeof NetworkConfigSchema>;

// =============================================================================
// Shell Sandbox
// =============================================================================

export const ShellConfigSchema = z.object({
  enabled: z.boolean().default(true),
  // Command allowlist - only these commands can run
  allowedCommands: z.array(z.string()).default([
    "git",
    "npm",
    "node",
    "python",
    "python3",
    "pip",
    "pytest",
    "ruff",
    "typescript",
    "tsc",
    "cargo",
    "rustc",
  ]),
  // Command blocklist - never allowed (dangerous)
  blockedCommands: z.array(z.string()).default([
    "rm -rf",
    "curl",
    "wget",
    "ssh",
    "scp",
    "sftp",
    "nc",
    "netcat",
    "ncat",
    "bash -i",
    "sh -i",
    "exec:",
    "eval",
    "base64 -d",
    "xxd -r",
  ]),
  // Environment restrictions
  envWhitelist: z.array(z.string()).default([
    "PATH",
    "HOME",
    "USER",
    "TMPDIR",
    "PWD",
    "LANG",
    "LC_ALL",
  ]),
  stripSensitiveEnv: z.boolean().default(true),
  // Process restrictions
  maxProcessTime: z.number().default(60), // seconds
  maxMemory: z.string().default("512MB"),
  maxProcesses: z.number().default(10),
  // Working directory
  workingDirectory: z.string().default("./"),
  // Pipe/redirect restrictions
  allowPipes: z.boolean().default(false),
  allowRedirects: z.boolean().default(false),
});
export type ShellConfig = z.infer<typeof ShellConfigSchema>;

// =============================================================================
// Monitoring Configuration
// =============================================================================

export const MonitoringConfigSchema = z.object({
  enabled: z.boolean().default(true),
  // Audit logging
  logAllOperations: z.boolean().default(true),
  auditPath: z.string().default(".forgewright/sandbox-audit.jsonl"),
  auditMaxSize: z.string().default("100MB"),
  // Bypass detection
  detectEscapeAttempts: z.boolean().default(true),
  alertOnBypass: z.boolean().default(true),
  // Metrics
  collectMetrics: z.boolean().default(true),
  metricsPath: z.string().default(".forgewright/sandbox-metrics.json"),
});
export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;

// =============================================================================
// Main Sandbox Configuration
// =============================================================================

export const SandboxConfigSchema = z.object({
  version: z.literal("1.0").default("1.0"),
  // Feature toggle
  enabled: z.boolean().default(false),
  // Execution mode
  mode: z.enum(["preview", "strict", "disabled"]).default("preview"),
  // Isolation level
  isolation: IsolationConfigSchema.optional(),
  // Per-type configs
  filesystem: FilesystemConfigSchema.optional(),
  network: NetworkConfigSchema.optional(),
  shell: ShellConfigSchema.optional(),
  // Monitoring
  monitoring: MonitoringConfigSchema.optional(),
  // Feature flags
  features: z.object({
    realTimeBlocking: z.boolean().default(true),
    autoRollback: z.boolean().default(false),
    sessionPersistence: z.boolean().default(true),
  }).optional(),
});

export type SandboxConfig = z.infer<typeof SandboxConfigSchema>;

// =============================================================================
// Operation Types (for policy evaluation)
// =============================================================================

export const OperationType = z.enum(["filesystem", "network", "shell"]);
export type OperationType = z.infer<typeof OperationType>;

export interface BaseOperation {
  type: OperationType;
  timestamp: number;
  sessionId?: string;
}

export interface FilesystemOperation extends BaseOperation {
  type: "filesystem";
  action: "read" | "write" | "delete" | "list" | "stat" | "exists";
  path: string;
  content?: string;
  metadata?: {
    size?: number;
    modified?: number;
    permissions?: string;
  };
}

export interface NetworkOperation extends BaseOperation {
  type: "network";
  action: "request" | "dns" | "connect";
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  domain?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ShellOperation extends BaseOperation {
  type: "shell";
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

export type SandboxOperation = FilesystemOperation | NetworkOperation | ShellOperation;

// =============================================================================
// Policy Evaluation Results
// =============================================================================

export const PolicyDecision = z.enum(["allow", "deny", "preview"]);
export type PolicyDecision = z.infer<typeof PolicyDecision>;

export interface PolicyResult {
  allowed: boolean;
  decision: PolicyDecision;
  reason: string;
  blockedPattern?: string;
  escapeVector?: EscapeVectorType;
  timestamp: number;
  sessionId?: string;
}

export interface PolicyViolation {
  operation: SandboxOperation;
  result: PolicyResult;
  auditId: string;
}

// =============================================================================
// Escape Vector Types (per OWASP + Tian Pan research)
// =============================================================================

export const EscapeVectorType = z.enum([
  "path_traversal",      // ../ or symlink bypass
  "symlink_escape",      // Symlink to restricted path
  "command_injection",    // Shell metacharacters injection
  "docker_socket",       // /var/run/docker.sock access
  "config_poisoning",    // Writing to ~/.gitconfig, ~/.zshrc
  "dns_exfiltration",    // DNS-based data exfiltration
  "ip_obfuscation",      // Direct IP instead of domain
  "kernel_cve",         // Container escape via kernel CVE
  "conversation_injection", // Prompt injection via context
  "subprocess_escape",   // Spawning subprocess to bypass restrictions
]);
export type EscapeVectorType = z.infer<typeof EscapeVectorType>;

// =============================================================================
// Audit Log Entry
// =============================================================================

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  sessionId?: string;
  operation: SandboxOperation;
  result: PolicyResult;
  duration?: number;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Metrics
// =============================================================================

export interface SandboxMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  operations: {
    total: number;
    allowed: number;
    denied: number;
    byType: {
      filesystem: { allowed: number; denied: number };
      network: { allowed: number; denied: number };
      shell: { allowed: number; denied: number };
    };
  };
  escapeAttempts: {
    total: number;
    byType: Partial<Record<EscapeVectorType, number>>;
  };
  averageLatencyMs: number;
}
