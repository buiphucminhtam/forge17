/**
 * Forgewright Sandbox - AI Code Execution Security Layer
 *
 * Provides sandboxed execution environment for AI-generated code based on
 * research from Tian Pan (2026) - Agent Sandboxing Spectrum
 *
 * Features:
 * - 5-level isolation (none → container → seccomp → gVisor → microVM)
 * - Filesystem sandbox (path restrictions, traversal detection)
 * - Network sandbox (domain allowlist, DNS blocking)
 * - Shell sandbox (command allowlist, environment sanitization)
 * - Escape vector detection and prevention
 * - Audit logging and metrics
 */

// Types
export {
  type SandboxConfig,
  type SandboxOperation,
  type FilesystemOperation,
  type NetworkOperation,
  type ShellOperation,
  type PolicyResult,
  type AuditLogEntry,
  type SandboxMetrics,
  type SandboxSession,
  type SandboxResult,
  type SandboxCheckResult,
  type IsolationLevel,
  type FilesystemConfig,
  type NetworkConfig,
  type ShellConfig,
  type EscapeVectorType,
  IsolationLevel,
} from "./types/sandbox.js";

// Manager
export {
  SandboxManager,
  getSandboxManager,
  createSandboxSession,
  endSandboxSession,
  type SandboxSession,
  type SandboxResult,
  type SandboxCheckResult,
} from "./manager/SandboxManager.js";

// Config
export {
  ConfigLoader,
  loadSandboxConfig,
  type LoadedConfig,
  type ConfigSource,
} from "./manager/ConfigLoader.js";

// Policy
export {
  PolicyEngine,
  createPolicyEngine,
} from "./manager/PolicyEngine.js";

// Monitors
export {
  AuditLogger,
  createAuditLogger,
} from "./monitors/AuditLogger.js";

export {
  BypassDetector,
  createBypassDetector,
} from "./monitors/BypassDetector.js";

/**
 * Quick start example:
 *
 * ```typescript
 * import {
 *   createSandboxSession,
 *   endSandboxSession,
 *   getSandboxManager,
 * } from './sandbox';
 *
 * // Start a session
 * await createSandboxSession({ enabled: true, mode: 'strict' });
 *
 * const manager = getSandboxManager();
 *
 * // Check if operation is allowed
 * const result = manager.check({
 *   type: 'filesystem',
 *   action: 'read',
 *   path: './src/index.ts',
 *   timestamp: Date.now(),
 * });
 *
 * console.log(result); // { allowed: true, decision: 'allow', reason: '...' }
 *
 * // End session and get metrics
 * const metrics = await endSandboxSession();
 * ```
 */
