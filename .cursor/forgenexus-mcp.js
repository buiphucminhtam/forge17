/**
 * ForgeNexus MCP Server Entry Point — forgewright workspace
 * Points to the local forgenexus dist.
 */

import { startMCPServer } from "../forgenexus/dist/mcp/server.js";

startMCPServer()
  .catch((err) => {
    console.error("[ForgeNexus MCP] Failed to start:", err);
    process.exit(1);
  });
