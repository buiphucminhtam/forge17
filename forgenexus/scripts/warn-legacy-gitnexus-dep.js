#!/usr/bin/env node
/**
 * After install: if the host project still depends on the old `gitnexus` npm package, warn.
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";

if (process.env.FORGENEXUS_QUIET_POSTINSTALL === "1") {
  process.exit(0);
}

function findHostPackageJsonPath() {
  if (process.env.INIT_CWD) {
    const p = join(process.env.INIT_CWD, "package.json");
    if (existsSync(p)) return p;
  }
  let d = process.cwd();
  for (let i = 0; i < 8; i++) {
    const p = join(d, "package.json");
    if (existsSync(p)) {
      try {
        const j = JSON.parse(readFileSync(p, "utf8"));
        if (j.name !== "forgenexus") return p;
      } catch {
        /* continue */
      }
    }
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }
  return null;
}

const pkgPath = findHostPackageJsonPath();
if (!pkgPath) {
  process.exit(0);
}

let pkg;
try {
  pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
} catch {
  process.exit(0);
}

const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.optionalDependencies };
if (deps.gitnexus) {
  console.warn(
    "[forgenexus] This project still lists npm package \"gitnexus\" in package.json. " +
      "Remove it and use \"forgenexus\" only (CLI: forgenexus, MCP server: forgenexus)."
  );
}
