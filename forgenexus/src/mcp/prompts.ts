/**
 * ForgeNexus MCP Prompts — 2 prompt templates.
 */

import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export function registerPrompts(server: Server): void {
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      {
        name: "detect_impact",
        description: "Analyze the impact of your current changes before committing.",
        arguments: [
          { name: "scope", description: "What to analyze: unstaged, staged, all, or compare", required: false },
          { name: "base_ref", description: "Branch/commit for compare scope", required: false },
        ],
      },
      {
        name: "generate_map",
        description: "Generate architecture documentation from the knowledge graph.",
        arguments: [{ name: "repo", description: "Repository name", required: false }],
      },
    ],
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === "detect_impact") {
      const scope = args?.scope ?? "all";
      const baseRef = args?.base_ref ?? "";
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: [
              "Analyze the impact of my current code changes before committing.",
              "",
              "Follow these steps:",
              `1. Run detect_changes({scope: "${scope}"${baseRef ? `, base_ref: "${baseRef}"` : ""}}) to find what changed`,
              "2. For each changed symbol, run impact({target: \"<name>\", direction: \"upstream\"}) for blast radius",
              "3. Summarize: changes, affected processes, risk level, and recommended actions",
            ].join("\n"),
          },
        }],
      };
    }
    if (name === "generate_map") {
      const repo = args?.repo ?? "";
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: [
              "Generate architecture documentation for this codebase.",
              "",
              "Follow these steps:",
              `1. READ forgenexus://repo/${repo || "{name}"}/context for codebase stats`,
              `2. READ forgenexus://repo/${repo || "{name}"}/clusters for all functional areas`,
              `3. READ forgenexus://repo/${repo || "{name}"}/processes for all execution flows`,
              `4. READ forgenexus://repo/${repo || "{name}"}/stats for detailed metrics`,
              "5. For top 5 processes, READ forgenexus://repo/{name}/process/{name}",
              "6. Generate a mermaid architecture diagram",
              "7. Write ARCHITECTURE.md with overview, areas, flows, and diagram",
            ].join("\n"),
          },
        }],
      };
    }
    throw new Error(`Unknown prompt: ${name}`);
  });
}
