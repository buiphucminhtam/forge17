/**
 * ForgeNexus MCP Tool Definitions — 13 tools (parity with GitNexus + ForgeNexus extras).
 */

import { readFileSync, writeFileSync } from "fs";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ForgeDB } from "../data/db.js";
import { analyzeImpact, computeMRO } from "../data/graph.js";
import { detectChanges, analyzePRReview } from "../analysis/detect-changes.js";
import { Registry } from "../data/registry.js";
import type { ChangeScope } from "../analysis/detect-changes.js";
import { findSimilar, hybridSearch } from "../data/embeddings.js";

export function registerTools(server: Server, db: ForgeDB, cwd: string): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const tool = TOOLS.find((t) => t.name === name);
      if (!tool) throw new Error(`Unknown tool: ${name}`);
      const result = await tool.handler(db, args ?? {}, cwd);
      return { content: [{ type: "text", text: result }] };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
    }
  });
}

const TOOLS: ToolDef[] = [
  {
    name: "list_repos",
    description: "List all indexed repositories available to ForgeNexus.",
    inputSchema: { type: "object", properties: {}, required: [] },
    handler: async (db) => {
      const repos = db.listRepos();
      if (repos.length === 0) return "No indexed repositories.";
      return repos.map((r) =>
        `- **${r.name}** | path: ${r.path} | indexed: ${r.indexedAt} | ${r.stats.nodes} nodes, ${r.stats.edges} edges`
      ).join("\n");
    },
  },
  {
    name: "query",
    description: "Query the code knowledge graph for execution flows related to a concept.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language or keyword search query" },
        limit: { type: "number", default: 5 },
        repo: { type: "string" },
      },
      required: ["query"],
    },
    handler: async (db, args) => {
      // Hybrid search: BM25 + Semantic + RRF (matches GitNexus approach)
      const provider = (process.env.EMBEDDING_PROVIDER as any) ?? 'transformers';
      let hybridResults: { uid: string; name: string; filePath: string; score: number; sources: string[] }[] = [];

      try {
        hybridResults = await hybridSearch(db, args.query, provider, args.limit ?? 5);
      } catch {
        // Fallback to FTS if hybrid search fails
      }

      // Fallback to plain FTS
      const ftsResults = hybridResults.length === 0
        ? db.searchSymbols(args.query, args.limit ?? 5)
        : [];

      if (ftsResults.length === 0 && hybridResults.length === 0) {
        return `No results for "${args.query}".`;
      }

      const lines: string[] = [];
      if (hybridResults.length > 0) {
        lines.push(`**Hybrid search** (BM25 + Semantic + RRF):`);
        for (const r of hybridResults) {
          const label = r.score >= 0.5 ? 'HIGH' : r.score >= 0.2 ? 'MED' : 'LOW';
          lines.push(`- [${r.name}] score=${r.score.toFixed(3)} (${label}) — ${r.filePath}`);
        }
      }
      if (ftsResults.length > 0) {
        if (hybridResults.length > 0) lines.push(`\n**Keyword matches** (FTS):`);
        for (const r of ftsResults) {
          lines.push(`- [${r.type}] **${r.name}** — ${r.filePath} (uid: ${r.uid})`);
        }
      }
      return lines.join("\n");
    },
  },
  {
    name: "context",
    description: "360-degree view of a single code symbol — callers, callees, references.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        uid: { type: "string" },
        include_content: { type: "boolean", default: false },
      },
      required: [],
    },
    handler: async (db, args) => {
      const uid = args.uid ?? (args.name ? db.getNodesByName(args.name)[0]?.uid : null);
      if (!uid) return `Symbol not found: ${args.name}`;
      const node = db.getNode(uid);
      if (!node) return `No symbol with uid: ${uid}`;

      const callers = db.getCallers(uid);
      const callees = db.getCallees(uid);
      const importers = db.getImporters(uid);
      const extenders = db.getExtendees(uid);
      const implementers = db.getImplementers(uid);
      const methods = db.getMethods(uid);
      const properties = db.getProperties(uid);

      let md = `## ${node.name}\n\n`;
      md += `**Type:** ${node.type}  \n**File:** ${node.filePath}:${node.line}  \n`;
      if (node.returnType) md += `**Returns:** ${node.returnType}  \n`;
      if (node.community) md += `**Community:** ${node.community}  \n`;
      if (node.process) md += `**Process:** ${node.process}  \n`;
      if (node.signature) md += `**Signature:** \`${node.signature.substring(0, 100)}\`\n\n`;

      md += `### Callers (${callers.length})\n`;
      md += callers.length > 0
        ? callers.map((c) => `- ${c.name} — ${c.filePath}:${c.line}`).join("\n")
        : "_No direct callers found._\n";

      md += `\n### Callees (${callees.length})\n`;
      md += callees.length > 0
        ? callees.map((c) => `- ${c.name} — ${c.filePath}:${c.line}`).join("\n")
        : "_No direct callees found._\n";

      md += `\n### Importers (${importers.length})\n`;
      md += importers.length > 0
        ? importers.map((i) => `- ${i.name} — ${i.filePath}:${i.line}`).join("\n")
        : "_No importers found._\n";

      md += `\n### Extends (${extenders.length})\n`;
      md += extenders.length > 0
        ? extenders.map((e) => `- ${e.name} — ${e.filePath}:${e.line}`).join("\n")
        : "_No extends found._\n";

      md += `\n### Implements (${implementers.length})\n`;
      md += implementers.length > 0
        ? implementers.map((e) => `- ${e.name} — ${e.filePath}:${e.line}`).join("\n")
        : "_No implements found._\n";

      if (node.type === 'Class' || node.type === 'Interface') {
        md += `\n### Methods (${methods.length})\n`;
        md += methods.length > 0
          ? methods.map((m) => `- ${m.name} — ${m.filePath}:${m.line}`).join("\n")
          : "_No methods found._\n";

        md += `\n### Properties (${properties.length})\n`;
        md += properties.length > 0
          ? properties.map((p) => `- ${p.name} — ${p.filePath}:${p.line}`).join("\n")
          : "_No properties found._\n";
      }

      return md;
    },
  },
  {
    name: "impact",
    description: "Analyze blast radius of changing a code symbol. Returns affected symbols by depth.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Symbol name or uid" },
        direction: { type: "string", enum: ["upstream", "downstream", "both"], default: "upstream" },
        maxDepth: { type: "number", description: "Maximum traversal depth (default: 3)", default: 3 },
        minConfidence: { type: "number", description: "Minimum edge confidence threshold (0.0–1.0, default: 0.0)" },
        includeTests: { type: "boolean", description: "Include test files in blast radius (default: false)", default: false },
        repo: { type: "string" },
      },
      required: ["target"],
    },
    handler: async (db, args) => {
      const minConfidence = args.minConfidence ?? 0.0;
      const includeTests = args.includeTests ?? false;
      const maxDepth = args.maxDepth ?? 3;

      const targetUid = db.getNodesByName(args.target)[0]?.uid ?? args.target;
      if (!targetUid) return `Symbol not found: ${args.target}`;
      const result = analyzeImpact(db, targetUid, maxDepth, { minConfidence, includeTests });

      let md = `## Impact Analysis: ${args.target}\n\n`;
      md += `**Risk:** ${result.risk}  \n`;
      md += `**Summary:** ${result.summary}\n`;
      md += `**Max depth:** ${maxDepth} | **Min confidence:** ${minConfidence} | **Tests included:** ${includeTests}\n\n`;
      md += "| Depth | Count | Meaning |\n|-------|-------|----------|\n";
      md += `| d=1 | ${result.byDepth.d1.length} | WILL BREAK — direct callers |\n`;
      md += `| d=2 | ${result.byDepth.d2.length} | LIKELY AFFECTED — indirect |\n`;
      md += `| d=3 | ${result.byDepth.d3.length} | MAY NEED TESTING — transitive |\n\n`;

      if (result.affectedTests.length > 0) {
        md += `**Affected tests:**\n`;
        for (const t of result.affectedTests.slice(0, 15)) {
          md += `- ${t}\n`;
        }
        md += "\n";
      }

      md += `**Affected modules:** ${result.affectedModules.join(", ") || "none"}\n`;
      md += `**Affected processes:** ${result.affectedProcesses.join(", ") || "none"}\n\n`;
      md += "**d=1 (WILL BREAK):**\n";
      for (const uid of result.byDepth.d1.slice(0, 20)) {
        const n = db.getNode(uid);
        if (n) md += `- ${n.name} — ${n.filePath}:${n.line}\n`;
      }
      md += "\n**d=2 (LIKELY AFFECTED):**\n";
      for (const uid of result.byDepth.d2.slice(0, 20)) {
        const n = db.getNode(uid);
        if (n) md += `- ${n.name} — ${n.filePath}:${n.line}\n`;
      }
      if (result.byDepth.d3.length > 0) {
        md += "\n**d=3 (TRANSITIVE):**\n";
        for (const uid of result.byDepth.d3.slice(0, 10)) {
          const n = db.getNode(uid);
          if (n) md += `- ${n.name} — ${n.filePath}:${n.line}\n`;
        }
      }
      return md;
    },
  },
  {
    name: "detect_changes",
    description: "Analyze uncommitted git changes and find affected execution flows.",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "string", enum: ["unstaged", "staged", "all", "compare"], default: "unstaged" },
        base_ref: { type: "string" },
      },
      required: [],
    },
    handler: async (db, args) => {
      const result = await detectChanges(db, args.scope ?? "unstaged", args.base_ref);
      let md = `## Change Detection\n\n`;
      md += `**Risk:** ${result.riskSummary}\n`;
      md += `**Changed symbols:** ${result.changedSymbols.length}\n`;
      md += `**Affected modules:** ${result.affectedModules.length}\n`;
      md += `**Affected processes:** ${result.affectedProcesses.length}\n\n`;
      md += "### Changed Symbols\n";
      for (const s of result.changedSymbols.slice(0, 30)) {
        md += `- [${s.type}] ${s.name} — ${s.filePath}\n`;
      }
      if (result.affectedProcesses.length > 0) {
        md += "\n### Affected Execution Flows\n";
        for (const p of result.affectedProcesses.slice(0, 10)) {
          const proc = (db as any).getProcess?.(p) ?? { name: p, type: 'unknown' };
          md += `- ${proc.name ?? p} (${proc.type ?? 'unknown'})\n`;
        }
      }
      return md;
    },
  },
  {
    name: "rename",
    description: "Multi-file coordinated rename using the knowledge graph + text search.",
    inputSchema: {
      type: "object",
      properties: {
        symbol_name: { type: "string" },
        new_name: { type: "string" },
        dry_run: { type: "boolean", default: true },
      },
      required: ["new_name"],
    },
    handler: async (db, args, cwd) => {
      const nodes = db.getNodesByName(args.symbol_name);
      if (nodes.length === 0) return `No symbol found: ${args.symbol_name}`;

      let md = `## Rename: ${args.symbol_name} -> ${args.new_name}\n\n`;
      md += `**Found in:** ${nodes.length} location(s)\n\n`;

      const edits: { filePath: string; old: string; new: string; line: number }[] = [];

      for (const node of nodes) {
        md += `- ${node.filePath}:${node.line} (${node.type})\n`;
        edits.push({
          filePath: node.filePath,
          old: args.symbol_name,
          new: args.new_name,
          line: node.line,
        });
      }

      // Find callers too (they reference the symbol)
      const callers = db.getCallers(nodes[0].uid);
      const callersWithSymbol = callers.filter(c => {
        try {
          const content = readFileSync(c.filePath, "utf8");
          const lines = content.split("\n");
          return lines.slice(Math.max(0, c.line - 5), Math.min(lines.length, c.line + 5))
            .some(l => l.includes(args.symbol_name));
        } catch { return false; }
      });

      if (callersWithSymbol.length > 0) {
        md += `\n**Callers that will be renamed:**\n`;
        for (const c of callersWithSymbol.slice(0, 10)) {
          md += `- ${c.filePath}:${c.line} (${c.type})\n`;
          edits.push({
            filePath: c.filePath,
            old: args.symbol_name,
            new: args.new_name,
            line: c.line,
          });
        }
      }

      if (!args.dry_run) {
        const uniqueFiles = [...new Set(edits.map(e => e.filePath))];
        for (const filePath of uniqueFiles) {
          try {
            const content = readFileSync(filePath, "utf8");
            const newContent = content.split(args.symbol_name).join(args.new_name);
            writeFileSync(filePath, newContent);
            const count = edits.filter(e => e.filePath === filePath).length;
            md += `\n✅ Updated: ${filePath} (${count} occurrence(s))\n`;
          } catch (e) {
            md += `\n⚠️ Failed to update: ${filePath} — ${e instanceof Error ? e.message : String(e)}\n`;
          }
        }
        md += `\n**Rename applied.** Re-run analyze to update the graph.\n`;
      } else {
        md += "\n*Set dry_run: false to apply changes.*\n";
      }

      return md;
    },
  },
  {
    name: "route_map",
    description: "Map HTTP routes to their handler functions.",
    inputSchema: { type: "object", properties: { repo: { type: "string" } }, required: [] },
    handler: async (db) => {
      const routes = db.getRouteHandlers();
      const allRoutes = (db as any).db.prepare(
        "SELECT from_uid, to_uid, reason FROM edges WHERE type = 'HANDLES_ROUTE'"
      ).all() as any[];

      if (routes.length === 0 && allRoutes.length === 0) {
        return "No route handlers found. Index API files (Express, FastAPI, Next.js, NestJS, Django routes).";
      }

      let md = "## Route Map\n\n";

      // Group by reason
      const byReason: Record<string, any[]> = {};
      for (const r of allRoutes) {
        const reason = r.reason ?? 'unknown';
        if (!byReason[reason]) byReason[reason] = [];
        byReason[reason].push(r);
      }

      for (const [reason, rows] of Object.entries(byReason)) {
        md += `### ${reason.replace('-', ' ').replace('_', ' ')}\n`;
        for (const r of (rows as any[]).slice(0, 20)) {
          const handler = db.getNode(r.to_uid);
          const route = r.from_uid;
          if (handler) {
            md += `- \`${route}\` → **${handler.name}** (${handler.filePath}:${handler.line})\n`;
          } else {
            md += `- \`${route}\` → ${r.to_uid}\n`;
          }
        }
        md += "\n";
      }

      // Summary
      md += `**Total routes:** ${allRoutes.length}\n`;
      return md;
    },
  },
  {
    name: "tool_map",
    description: "Map MCP/RPC tool definitions and handler locations.",
    inputSchema: { type: "object", properties: { repo: { type: "string" } }, required: [] },
    handler: async (db) => {
      const allTools = db.getToolHandlers();
      const allToolEdges = (db as any).db.prepare(
        "SELECT from_uid, to_uid, reason FROM edges WHERE type = 'HANDLES_TOOL'"
      ).all() as any[];

      if (allToolEdges.length === 0) {
        return "No tool definitions found. Index files with @tool, @command decorators or tool handler objects.";
      }

      let md = "## Tool Map\n\n";
      for (const t of allToolEdges.slice(0, 30)) {
        const handler = db.getNode(t.to_uid);
        if (handler) {
          md += `- **${t.from_uid.split(':').pop()}** → ${handler.name} (${handler.filePath}:${handler.line})\n`;
        } else {
          md += `- **${t.from_uid}** → ${t.to_uid}\n`;
        }
      }
      md += `\n**Total tools:** ${allToolEdges.length}\n`;
      return md;
    },
  },
  {
    name: "shape_check",
    description: "Detect API response shape mismatches vs consumer property access.",
    inputSchema: {
      type: "object",
      properties: {
        repo: { type: "string" },
      },
      required: [],
    },
    handler: async (db, args) => {
      // Find interface/type definitions
      const interfaces = db.getNodesByType('Interface');
      const classes = db.getNodesByType('Class');
      const functions = db.getNodesByType('Function');

      // Look for return type annotations that suggest API responses
      const apiResponses: { name: string; filePath: string; returnType: string | undefined }[] = [];

      for (const fn of functions) {
        if (fn.returnType && /^[A-Z]/.test(fn.returnType)) {
          apiResponses.push({ name: fn.name, filePath: fn.filePath, returnType: fn.returnType });
        }
      }

      // Look for access patterns (property accesses on return values)
      const accesses = (db as any).db.prepare(
        "SELECT from_uid, to_uid, reason FROM edges WHERE type = 'ACCESSES'"
      ).all() as any[];

      if (apiResponses.length === 0 && accesses.length === 0) {
        return [
          "## Shape Check Results",
          "",
          "No API response types with property access patterns found.",
          "Shape checking works best with:",
          "- TypeScript interfaces/classes with return type annotations",
          "- Property access patterns (obj.prop, obj.method())",
          "",
          "Make sure your code uses typed return values for best results.",
        ].join("\n");
      }

      let md = "## Shape Check Results\n\n";
      md += `**API response types found:** ${apiResponses.length}\n`;
      md += `**Property accesses found:** ${accesses.length}\n\n`;

      // Analyze return types
      const returnTypes = new Set<string>();
      for (const r of apiResponses) {
        if (r.returnType) returnTypes.add(r.returnType);
      }

      md += "### Return Types (potential API shapes)\n";
      for (const rt of [...returnTypes].slice(0, 10)) {
        const matchingInterfaces = interfaces.filter(i =>
          i.name === rt || i.name.includes(rt) || rt.includes(i.name)
        );
        if (matchingInterfaces.length > 0) {
          md += `- \`${rt}\` → matches interface **${matchingInterfaces[0].name}**\n`;
        } else {
          md += `- \`${rt}\` → no matching interface found\n`;
        }
      }

      // Check for potentially unsafe accesses
      const suspicious: string[] = [];
      for (const a of accesses.slice(0, 20)) {
        const targetName = a.to_uid.replace('UNKNOWN:Property:', '').replace(':0', '');
        // Look for accesses that might not be in any interface
        const safe = interfaces.some(i =>
          db.getProperties(i.uid).some(p => p.name === targetName)
        );
        if (!safe) {
          const fromNode = db.getNode(a.from_uid);
          suspicious.push(`  - ${fromNode?.name ?? a.from_uid} accesses \`${targetName}\` (untyped)\n`);
        }
      }

      if (suspicious.length > 0) {
        md += "\n### Suspicious Property Accesses (no type safety)\n";
        md += suspicious.join("");
        md += "\n*These accesses may be accessing properties not defined in any interface.*\n";
      } else {
        md += "\n✅ No suspicious property accesses detected.\n";
      }

      return md;
    },
  },
  {
    name: "api_impact",
    description: "Combined API impact: route_map + shape_check + impact analysis.",
    inputSchema: {
      type: "object",
      properties: {
        endpoint: { type: "string" },
        repo: { type: "string" },
      },
      required: [],
    },
    handler: async (db, args) => {
      const target = args.endpoint ?? '';

      let md = "## API Impact Analysis\n\n";

      // Find route handlers
      const routes = db.getRouteHandlers();
      const relevantRoutes = target
        ? routes.filter(r => r.route.toLowerCase().includes(target.toLowerCase()))
        : routes.slice(0, 5);

      if (relevantRoutes.length === 0) {
        md += "No matching routes found. Try providing an endpoint name.\n\n";
      }

      md += `**Routes analyzed:** ${relevantRoutes.length}\n\n`;

      for (const route of relevantRoutes.slice(0, 5)) {
        const handler = route.handler;
        md += `### Route: \`${route.route}\`\n`;
        md += `**Handler:** ${handler.name} (${handler.filePath}:${handler.line})\n`;

        // Impact of the handler
        const impact = analyzeImpact(db, handler.uid);
        md += `**Risk:** ${impact.risk}\n`;
        md += `**Callers:** ${impact.byDepth.d1.length} | **Indirect:** ${impact.byDepth.d2.length}\n`;

        // Return type analysis
        if (handler.returnType) {
          md += `**Return type:** \`${handler.returnType}\`\n`;
        }

        // Properties accessed
        const accesses = (db as any).db.prepare(
          "SELECT from_uid, to_uid FROM edges WHERE type = 'ACCESSES' AND from_uid = ?"
        ).all(handler.uid) as any[];
        if (accesses.length > 0) {
          md += `**Property accesses:** ${accesses.length}\n`;
        }

        md += "\n";
      }

      // Summary stats
      const stats = db.getDetailedStats();
      md += "### Overall API Stats\n";
      md += `| Metric | Count |\n|--------|-------|\n`;
      md += `| Routes | ${routes.length} |\n`;
      md += `| API Functions | ${stats.byType['Function'] ?? 0} |\n`;
      md += `| Property Accesses | ${stats.byEdgeType['ACCESSES'] ?? 0} |\n`;
      md += `| Query Edges | ${stats.byEdgeType['QUERIES'] ?? 0} |\n`;

      return md;
    },
  },
  {
    name: "cypher",
    description: "Execute Cypher-style query against the code knowledge graph (simplified).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language or keyword query" },
        repo: { type: "string" },
      },
      required: ["query"],
    },
    handler: async (db, args) => {
      const results = db.searchSymbols(args.query, 20);
      if (results.length === 0) return `No results for: ${args.query}`;
      let md = `## Results for: ${args.query}\n\n`;
      for (const r of results) {
        const callers = db.getCallers(r.uid);
        md += `### [${r.type}] **${r.name}** — ${r.filePath}\n`;
        if (callers.length > 0) {
          md += "  Callers:\n";
          for (const c of callers.slice(0, 5)) {
            md += `  - ${c.name} (${c.filePath})\n`;
          }
        }
      }
      return md;
    },
  },
  {
    name: "pr_review",
    description: "PR Review blast-radius analysis — analyzes what would break if a PR is merged. Shows affected modules, breaking changes, recommended reviewers. Use instead of detect_changes for PR analysis.",
    inputSchema: {
      type: "object",
      properties: {
        base_ref: { type: "string", description: "Base branch/ref to compare against (e.g., main, origin/main)" },
        head_ref: { type: "string", description: "Head branch/ref to compare (default: HEAD)" },
        repo: { type: "string" },
      },
      required: ["base_ref"],
    },
    handler: async (db, args) => {
      const result = analyzePRReview(db, args.base_ref, args.head_ref ?? "HEAD");

      let md = `## PR Review — Blast Radius Analysis\n\n`;
      md += `**Files changed:** ${result.filesChanged}  \n`;
      md += `**Symbols changed:** ${result.symbolsChanged}  \n`;
      md += `**Risk Level:** ${result.riskLevel}\n\n`;
      md += `### Blast Radius\n`;
      md += `| Severity | Count |\n|---------|-------|\n`;
      md += `| Critical | ${result.blastRadius.critical} |\n`;
      md += `| High     | ${result.blastRadius.high} |\n`;
      md += `| Medium   | ${result.blastRadius.medium} |\n`;
      md += `| Low      | ${result.blastRadius.low} |\n\n`;

      if (result.breakingChanges.length > 0) {
        md += `### Breaking Changes\n`;
        for (const bc of result.breakingChanges) md += `- ${bc}\n`;
        md += "\n";
      }

      if (result.topImpactSymbols.length > 0) {
        md += `### Top Impact Symbols\n`;
        md += `| Symbol | File | Callers | Risk |\n|-------|------|---------|------|\n`;
        for (const s of result.topImpactSymbols.slice(0, 10)) {
          md += `| ${s.name} | ${s.filePath.split("/").pop()} | ${s.callers} | ${s.risk} |\n`;
        }
        md += "\n";
      }

      if (result.affectedModules.length > 0) {
        md += `### Affected Modules (${result.affectedModules.length})\n`;
        md += result.affectedModules.slice(0, 10).map(m => `- ${m}`).join("\n") + "\n\n";
      }

      if (result.affectedAPIs.length > 0) {
        md += `### Affected APIs\n`;
        md += result.affectedAPIs.slice(0, 10).map(a => `- ${a}`).join("\n") + "\n\n";
      }

      if (result.affectedTests.length > 0) {
        md += `### Affected Tests\n`;
        md += result.affectedTests.slice(0, 10).map(t => `- ${t}`).join("\n") + "\n\n";
      }

      if (result.recommendedReviewers.length > 0) {
        md += `### Recommended Reviewers\n`;
        md += result.recommendedReviewers.map(r => `- ${r}`).join("\n") + "\n\n";
      }

      md += `*Risk summary: ${result.riskSummary}*`;

      return md;
    },
  },
];

interface ToolDef {
  name: string;
  description: string;
  inputSchema: any;
  handler: (db: ForgeDB, args: any, cwd: string) => Promise<string>;
}
