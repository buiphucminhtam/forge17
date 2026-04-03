/**
 * clean subcommand — remove index from a codebase.
 */

import { existsSync, rmSync } from "fs";
import { join } from "path";
import { ForgeDB } from "../data/db.js";

export function clean(opts: { repoPath: string }): void {
  const { repoPath } = opts;
  const nexusDir = join(repoPath, ".gitnexus");
  const dbPath = join(nexusDir, "codebase.db");

  if (existsSync(dbPath)) {
    rmSync(dbPath, { force: true });
    console.error(`[ForgeNexus] Removed: ${dbPath}`);
  }

  if (existsSync(nexusDir)) {
    rmSync(nexusDir, { recursive: true, force: true });
    console.error(`[ForgeNexus] Removed directory: ${nexusDir}`);
  }

  console.error("[ForgeNexus] Clean complete.");
}
