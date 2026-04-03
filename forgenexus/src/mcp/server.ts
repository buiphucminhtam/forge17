/**
 * ForgeNexus MCP Server - stdio transport.
 * Exposes 11 tools + 8 resources + 2 prompts to AI agents.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ForgeDB } from "../data/db.js";
import { Registry } from "../data/registry.js";
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";
import { registerPrompts } from "./prompts.js";
import { analyze } from "../cli/analyze.js";

export async function startMCPServer(repoPath?: string) {
  const cwd = repoPath ?? process.cwd();
  const registry = new Registry();
  let repo = registry.getByPath(cwd);

  if (!repo) {
    await analyze({ repoPath: cwd, silent: true });
    repo = registry.getByPath(cwd);
  }

  if (!repo) throw new Error(`No indexed repo at ${cwd}. Run 'forgenexus analyze' first.`);

  const db = new ForgeDB(repo.path + "/.gitnexus/codebase.db");

  const server = new Server({ name: "forgenexus", version: "1.0.0" }, { capabilities: { tools: {}, resources: {}, prompts: {} } });

  registerTools(server, db, cwd);
  registerResources(server, db, cwd);
  registerPrompts(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}
