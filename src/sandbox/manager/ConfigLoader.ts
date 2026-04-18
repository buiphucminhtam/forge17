/**
 * Sandbox Config Loader
 *
 * Loads and validates sandbox configuration from multiple sources:
 * 1. Default config (built-in)
 * 2. User config (~/.config/forgewright/sandbox.yaml)
 * 3. Project config (.forgewright/sandbox.yaml)
 * 4. Environment variables (FORGE_SANDBOX_*)
 * 5. Inline config (highest priority)
 */

import fs from "fs";
import path from "path";
import yaml from "yaml";
import { z } from "zod";
import {
  SandboxConfigSchema,
  SandboxConfig,
  FilesystemConfigSchema,
  NetworkConfigSchema,
  ShellConfigSchema,
  IsolationConfigSchema,
  MonitoringConfigSchema,
  type SandboxOperation,
} from "../types/sandbox.js";

export interface ConfigSource {
  source: "default" | "user" | "project" | "env" | "inline";
  path?: string;
  priority: number;
}

export interface LoadedConfig {
  config: SandboxConfig;
  sources: ConfigSource[];
  warnings: string[];
}

/**
 * Config loader with layered resolution
 */
export class ConfigLoader {
  private defaultConfig: SandboxConfig;
  private userConfigPath: string;
  private projectConfigPath: string;

  constructor() {
    this.defaultConfig = this.getDefaultConfig();
    this.userConfigPath = path.join(
      process.env.HOME || "~",
      ".config",
      "forgewright",
      "sandbox.yaml"
    );
    this.projectConfigPath = ".forgewright/sandbox.yaml";
  }

  /**
   * Load config from all sources with priority
   * Priority: inline > env > project > user > default
   */
  load(inlineConfig?: Partial<SandboxConfig>): LoadedConfig {
    const sources: ConfigSource[] = [];
    const warnings: string[] = [];
    let config = { ...this.defaultConfig };

    // 1. Default config
    sources.push({ source: "default", priority: 1 });

    // 2. User config (~/.config/forgewright/sandbox.yaml)
    const userConfig = this.loadFromPath(this.userConfigPath);
    if (userConfig) {
      config = this.merge(config, userConfig);
      sources.push({
        source: "user",
        path: this.userConfigPath,
        priority: 2,
      });
    }

    // 3. Project config (.forgewright/sandbox.yaml)
    const projectConfig = this.loadFromPath(this.projectConfigPath);
    if (projectConfig) {
      config = this.merge(config, projectConfig);
      sources.push({
        source: "project",
        path: this.projectConfigPath,
        priority: 3,
      });
    }

    // 4. Environment variables
    const envConfig = this.loadFromEnv();
    if (Object.keys(envConfig).length > 0) {
      config = this.merge(config, envConfig);
      sources.push({ source: "env", priority: 4 });
    }

    // 5. Inline config (highest priority)
    if (inlineConfig) {
      config = this.merge(config, inlineConfig);
      sources.push({ source: "inline", priority: 5 });
    }

    // Validate final config
    const validationResult = SandboxConfigSchema.safeParse(config);
    if (!validationResult.success) {
      warnings.push(
        `Config validation errors: ${validationResult.error.message}`
      );
      // Use default values for invalid fields
      config = this.fillDefaults(validationResult.error, config);
    }

    // Apply feature flags from env
    config = this.applyFeatureFlags(config);

    return { config, sources, warnings };
  }

  /**
   * Load config from YAML file
   */
  private loadFromPath(filePath: string): Partial<SandboxConfig> | null {
    try {
      const resolvedPath = path.resolve(filePath.replace("~", process.env.HOME || ""));
      if (!fs.existsSync(resolvedPath)) {
        return null;
      }
      const content = fs.readFileSync(resolvedPath, "utf-8");
      const parsed = yaml.parse(content);
      return parsed as Partial<SandboxConfig>;
    } catch (error) {
      console.warn(`Warning: Failed to load config from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Load config from environment variables
   */
  private loadFromEnv(): Partial<SandboxConfig> {
    const config: Partial<SandboxConfig> = {};

    // Feature toggle
    if (process.env.FORGE_SANDBOX_ENABLED !== undefined) {
      config.enabled = process.env.FORGE_SANDBOX_ENABLED === "true";
    }

    // Mode
    if (process.env.FORGE_SANDBOX_MODE !== undefined) {
      config.mode = process.env.FORGE_SANDBOX_MODE as
        | "preview"
        | "strict"
        | "disabled";
    }

    // Isolation level
    if (process.env.FORGE_SANDBOX_ISOLATION_LEVEL !== undefined) {
      config.isolation = {
        ...config.isolation,
        level: process.env.FORGE_SANDBOX_ISOLATION_LEVEL as any,
      };
    }

    // Filesystem paths
    if (process.env.FORGE_SANDBOX_ALLOWED_PATHS !== undefined) {
      config.filesystem = {
        ...config.filesystem,
        allowedPaths: process.env.FORGE_SANDBOX_ALLOWED_PATHS.split(",").map(
          (p) => p.trim()
        ),
      };
    }

    // Network domains
    if (process.env.FORGE_SANDBOX_ALLOWED_DOMAINS !== undefined) {
      config.network = {
        ...config.network,
        allowedDomains: process.env.FORGE_SANDBOX_ALLOWED_DOMAINS.split(",").map(
          (d) => d.trim()
        ),
      };
    }

    // Shell commands
    if (process.env.FORGE_SANDBOX_ALLOWED_COMMANDS !== undefined) {
      config.shell = {
        ...config.shell,
        allowedCommands: process.env.FORGE_SANDBOX_ALLOWED_COMMANDS.split(
          ","
        ).map((c) => c.trim()),
      };
    }

    return config;
  }

  /**
   * Apply feature flags based on environment
   */
  private applyFeatureFlags(config: SandboxConfig): SandboxConfig {
    // Auto-enable if running in CI
    if (process.env.CI === "true") {
      config.enabled = true;
      config.mode = "strict";
    }

    // Enable real-time blocking in production
    if (process.env.NODE_ENV === "production") {
      config.features = {
        ...config.features,
        realTimeBlocking: true,
      };
    }

    return config;
  }

  /**
   * Deep merge two configs
   */
  private merge(
    base: Partial<SandboxConfig>,
    override: Partial<SandboxConfig>
  ): Partial<SandboxConfig> {
    const result = { ...base };

    for (const key of Object.keys(override) as (keyof SandboxConfig)[]) {
      const baseValue = base[key];
      const overrideValue = override[key];

      if (
        overrideValue !== undefined &&
        overrideValue !== null &&
        typeof overrideValue === "object" &&
        !Array.isArray(overrideValue)
      ) {
        result[key] = {
          ...(baseValue as any),
          ...(overrideValue as any),
        } as any;
      } else if (overrideValue !== undefined) {
        result[key] = overrideValue as any;
      }
    }

    return result;
  }

  /**
   * Fill default values for invalid fields
   */
  private fillDefaults(
    error: z.ZodError,
    config: Partial<SandboxConfig>
  ): SandboxConfig {
    const defaults = this.getDefaultConfig();

    for (const issue of error.issues) {
      const path = issue.path.join(".");
      switch (path) {
        case "mode":
          config.mode = defaults.mode;
          break;
        case "enabled":
          config.enabled = defaults.enabled;
          break;
        case "filesystem":
          config.filesystem = defaults.filesystem;
          break;
        case "network":
          config.network = defaults.network;
          break;
        case "shell":
          config.shell = defaults.shell;
          break;
        case "isolation":
          config.isolation = defaults.isolation;
          break;
        default:
          // For nested properties, set the parent to default
          if (path.startsWith("filesystem.")) {
            config.filesystem = defaults.filesystem;
          } else if (path.startsWith("network.")) {
            config.network = defaults.network;
          } else if (path.startsWith("shell.")) {
            config.shell = defaults.shell;
          }
      }
    }

    return config as SandboxConfig;
  }

  /**
   * Get default configuration (safe defaults)
   */
  private getDefaultConfig(): SandboxConfig {
    return {
      version: "1.0",
      enabled: false, // Disabled by default for safety
      mode: "preview", // Preview mode = ask before executing
      isolation: {
        level: "seccomp", // L2 by default (good balance of security/performance)
        fallback: "container",
        seccomp: {
          enabled: true,
          profile: "ai-agent",
          blockedSyscalls: [
            "mount",
            "ptrace",
            "unshare",
            "keyctl",
            "perf_event_open",
            "bpf",
          ],
        },
      },
      filesystem: {
        enabled: true,
        allowedPaths: ["./src", "./tests", "./lib"],
        blockedPaths: [
          "~/.ssh",
          "~/.gitconfig",
          "~/.zshrc",
          "~/.bashrc",
          "/etc",
          "/var",
          "/root",
          "/sys",
          "/proc",
        ],
        maxFileSize: "10MB",
        allowCreate: true,
        allowDelete: false,
        allowSymlink: false,
        resolveRealPath: true,
        readOnlyRoot: true,
        workspaceDir: "/tmp/forge-sandbox",
      },
      network: {
        enabled: true,
        allowedDomains: [
          "api.github.com",
          "pypi.org",
          "npmjs.com",
          "registry.npmjs.org",
        ],
        blockedDomains: ["internal.corp.com", "localhost", "127.0.0.1"],
        allowedProtocols: ["https"],
        blockDns: true,
        allowDnsResolution: false,
        timeout: 30,
        maxResponseSize: "5MB",
        logAllRequests: true,
      },
      shell: {
        enabled: true,
        allowedCommands: [
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
        ],
        blockedCommands: [
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
        ],
        envWhitelist: [
          "PATH",
          "HOME",
          "USER",
          "TMPDIR",
          "PWD",
          "LANG",
          "LC_ALL",
        ],
        stripSensitiveEnv: true,
        maxProcessTime: 60,
        maxMemory: "512MB",
        maxProcesses: 10,
        workingDirectory: "./",
        allowPipes: false,
        allowRedirects: false,
      },
      monitoring: {
        enabled: true,
        logAllOperations: true,
        auditPath: ".forgewright/sandbox-audit.jsonl",
        auditMaxSize: "100MB",
        detectEscapeAttempts: true,
        alertOnBypass: true,
        collectMetrics: true,
        metricsPath: ".forgewright/sandbox-metrics.json",
      },
      features: {
        realTimeBlocking: true,
        autoRollback: false,
        sessionPersistence: true,
      },
    };
  }

  /**
   * Validate a specific operation against config
   */
  validateOperation(
    operation: SandboxOperation,
    config: SandboxConfig
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (operation.type) {
      case "filesystem":
        if (!config.filesystem?.enabled) {
          errors.push("Filesystem sandbox is disabled");
        }
        break;

      case "network":
        if (!config.network?.enabled) {
          errors.push("Network sandbox is disabled");
        }
        break;

      case "shell":
        if (!config.shell?.enabled) {
          errors.push("Shell sandbox is disabled");
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get config summary for debugging
   */
  getSummary(config: SandboxConfig): string {
    return [
      `Sandbox Config (v${config.version})`,
      `  Enabled: ${config.enabled}`,
      `  Mode: ${config.mode}`,
      `  Isolation: ${config.isolation?.level || "none"}`,
      `  Filesystem: ${config.filesystem?.enabled ? "enabled" : "disabled"}`,
      `    - Allowed paths: ${config.filesystem?.allowedPaths?.length || 0}`,
      `    - Blocked paths: ${config.filesystem?.blockedPaths?.length || 0}`,
      `  Network: ${config.network?.enabled ? "enabled" : "disabled"}`,
      `    - Allowed domains: ${config.network?.allowedDomains?.length || 0}`,
      `    - Block DNS: ${config.network?.blockDns}`,
      `  Shell: ${config.shell?.enabled ? "enabled" : "disabled"}`,
      `    - Allowed commands: ${config.shell?.allowedCommands?.length || 0}`,
      `    - Blocked commands: ${config.shell?.blockedCommands?.length || 0}`,
    ].join("\n");
  }
}

// Singleton instance
let configLoaderInstance: ConfigLoader | null = null;

export function getConfigLoader(): ConfigLoader {
  if (!configLoaderInstance) {
    configLoaderInstance = new ConfigLoader();
  }
  return configLoaderInstance;
}

export function loadSandboxConfig(
  inlineConfig?: Partial<SandboxConfig>
): LoadedConfig {
  return getConfigLoader().load(inlineConfig);
}
