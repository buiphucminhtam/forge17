/**
 * Sandbox Config Loader Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ConfigLoader, loadSandboxConfig } from "../manager/ConfigLoader";
import type { SandboxConfig } from "../types/sandbox";

describe("ConfigLoader", () => {
  let loader: ConfigLoader;

  beforeEach(() => {
    loader = new ConfigLoader();
  });

  describe("load()", () => {
    it("should return default config when no custom config", () => {
      const result = loader.load();

      expect(result.config).toBeDefined();
      expect(result.config.version).toBe("1.0");
      expect(result.config.enabled).toBe(false); // Disabled by default
      expect(result.config.mode).toBe("preview");
    });

    it("should include all config sources", () => {
      const result = loader.load();

      expect(result.sources).toBeDefined();
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.sources[0].source).toBe("default");
    });

    it("should accept inline config overrides", () => {
      const result = loader.load({
        enabled: true,
        mode: "strict",
      });

      expect(result.config.enabled).toBe(true);
      expect(result.config.mode).toBe("strict");
    });

    it("should apply defaults for missing fields", () => {
      const result = loader.load({ enabled: true });

      expect(result.config.mode).toBe("preview"); // default
      expect(result.config.isolation?.level).toBe("seccomp"); // default
    });
  });

  describe("getSummary()", () => {
    it("should return formatted config summary", () => {
      const result = loader.load();
      const summary = loader.getSummary(result.config);

      expect(summary).toContain("Sandbox Config");
      expect(summary).toContain("v1.0");
      expect(summary).toContain("Enabled:");
      expect(summary).toContain("Isolation:");
    });
  });

  describe("validateOperation()", () => {
    it("should validate filesystem operation", () => {
      const result = loader.load();
      const validation = loader.validateOperation(
        {
          type: "filesystem",
          action: "read",
          path: "./src/index.ts",
          timestamp: Date.now(),
        },
        result.config
      );

      expect(validation.valid).toBe(true);
    });
  });
});

describe("loadSandboxConfig()", () => {
  it("should return loaded config", () => {
    const result = loadSandboxConfig();

    expect(result.config).toBeDefined();
    expect(result.sources).toBeDefined();
  });

  it("should apply custom config", () => {
    const result = loadSandboxConfig({
      enabled: true,
      mode: "strict",
    });

    expect(result.config.enabled).toBe(true);
    expect(result.config.mode).toBe("strict");
  });
});
