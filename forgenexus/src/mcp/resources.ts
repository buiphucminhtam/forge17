/**
 * ForgeNexus MCP Resources — 8 resource templates (fully implemented).
 */

import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ForgeDB } from "../data/db.js";

export function registerResources(server: Server, db: ForgeDB, _cwd: string): void {
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      { uri: "forgenexus://repos", name: "All Indexed Repositories", mimeType: "text/yaml" },
      { uri: "forgenexus://schema", name: "Graph Schema", mimeType: "text/yaml" },
    ],
  }));

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [
      { uriTemplate: "forgenexus://repo/{name}/context", name: "Repo Overview", mimeType: "text/yaml" },
      { uriTemplate: "forgenexus://repo/{name}/clusters", name: "Repo Modules", mimeType: "text/yaml" },
      { uriTemplate: "forgenexus://repo/{name}/processes", name: "Repo Processes", mimeType: "text/yaml" },
      { uriTemplate: "forgenexus://repo/{name}/schema", name: "Graph Schema", mimeType: "text/yaml" },
      { uriTemplate: "forgenexus://repo/{name}/cluster/{clusterName}", name: "Cluster Detail", mimeType: "text/yaml" },
      { uriTemplate: "forgenexus://repo/{name}/process/{processName}", name: "Process Trace", mimeType: "text/yaml" },
      { uriTemplate: "forgenexus://repo/{name}/stats", name: "Detailed Stats", mimeType: "text/yaml" },
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    const text = await readResource(uri, db);
    return { contents: [{ uri, mimeType: "text/yaml", text }] };
  });
}

async function readResource(uri: string, db: ForgeDB): Promise<string> {
  if (uri === "forgenexus://schema") {
    return [
      "# ForgeNexus Graph Schema",
      "",
      "## Node Types",
      "- File, Folder, Function, Class, Interface, Method, Property, Variable,",
      "  Struct, Enum, Trait, Impl, TypeAlias, Module",
      "",
      "## Edge Types (17 types — single edges table with type property)",
      "- CONTAINS, DEFINES, CALLS, IMPORTS, EXTENDS, IMPLEMENTS",
      "- HAS_METHOD, HAS_PROPERTY, ACCESSES, OVERRIDES",
      "- MEMBER_OF, STEP_IN_PROCESS, HANDLES_ROUTE, FETCHES",
      "- HANDLES_TOOL, ENTRY_POINT_OF, QUERIES",
      "",
      "## Community Detection",
      "- Leiden-inspired greedy modularity optimization",
      "- Communities stored in 'communities' table",
      "",
      "## Process Tracing",
      "- Entry point detection: HTTP routes, CLI commands, main functions",
      "- BFS call-chain traversal to find process steps",
      "- Processes stored in 'processes' table",
      "",
      "## Example Cypher Queries",
      "MATCH (a)-[:CALLS]->(b:Function {name: 'validateUser'})",
      "  RETURN a.name, a.filePath",
      "MATCH (f)-[:MEMBER_OF]->(c)",
      "  WHERE c.name = 'auth'",
      "  RETURN f.name",
      "MATCH (c:Class)-[:EXTENDS|:IMPLEMENTS]->(p)",
      "  RETURN c.name, p.name",
    ].join("\n");
  }

  const parts = uri.replace("forgenexus://", "").split("/");

  if (parts[0] === "repo" && parts[2] === "context") {
    const stats = db.getDetailedStats();
    return [
      "# Repo Context",
      "",
      "stats:",
      `  files: ${stats.files}`,
      `  nodes: ${stats.nodes}`,
      `  edges: ${stats.edges}`,
      `  communities: ${stats.communities}`,
      `  processes: ${stats.processes}`,
      `  has_embeddings: ${stats.hasEmbeddings}`,
      "",
      "by_type:",
      ...Object.entries(stats.byType ?? {}).map(([t, c]) => `  ${t}: ${c}`),
      "",
      "by_edge_type:",
      ...Object.entries(stats.byEdgeType ?? {}).map(([t, c]) => `  ${t}: ${c}`),
    ].join("\n");
  }

  if (parts[0] === "repo" && parts[2] === "stats") {
    const stats = db.getDetailedStats();
    const meta = {
      indexedAt: db.getMeta("indexed_at"),
      lastCommit: db.getMeta("last_commit"),
      repoName: db.getMeta("repo_name"),
    };

    return [
      "# Detailed Repository Statistics",
      "",
      "meta:",
      `  indexed_at: ${meta.indexedAt ?? "unknown"}`,
      `  last_commit: ${meta.lastCommit ?? "none"}`,
      `  repo_name: ${meta.repoName ?? "unknown"}`,
      "",
      "summary:",
      `  files: ${stats.files}`,
      `  nodes: ${stats.nodes}`,
      `  edges: ${stats.edges}`,
      `  communities: ${stats.communities}`,
      `  processes: ${stats.processes}`,
      `  has_embeddings: ${stats.hasEmbeddings}`,
      "",
      "nodes_by_type:",
      ...Object.entries(stats.byType ?? {}).map(([t, c]) => `  ${t}: ${c}`),
      "",
      "edges_by_type:",
      ...Object.entries(stats.byEdgeType ?? {}).map(([t, c]) => `  ${t}: ${c}`),
    ].join("\n");
  }

  if (parts[0] === "repo" && parts[2] === "clusters") {
    const comms = db.getAllCommunities();
    const lines = ["# Communities (Functional Areas)", ""];
    for (const c of comms.slice(0, 20)) {
      lines.push(`- name: ${c.name}`);
      lines.push(`  cohesion: ${c.cohesion}`);
      lines.push(`  symbols: ${c.symbolCount}`);
      lines.push(`  keywords: [${c.keywords.join(", ")}]`);
      lines.push(`  description: "${c.description}"`);
    }
    if (comms.length > 20) {
      lines.push(`... and ${comms.length - 20} more communities`);
    }
    return lines.join("\n");
  }

  if (parts[0] === "repo" && parts[2] === "processes") {
    const procs = db.getAllProcesses();
    const lines = ["# Execution Flows", ""];
    for (const p of procs.slice(0, 20)) {
      lines.push(`- id: ${p.id}`);
      lines.push(`  name: ${p.name}`);
      lines.push(`  type: ${p.type}`);
      lines.push(`  entry_point: ${p.entryPointUid}`);
      lines.push(`  communities: [${p.communities.join(", ")}]`);
    }
    if (procs.length > 20) {
      lines.push(`... and ${procs.length - 20} more processes`);
    }
    return lines.join("\n");
  }

  if (parts[0] === "repo" && parts[2] === "cluster" && parts[3]) {
    const clusterName = parts[3];
    const community = db.getCommunity(`comm_${clusterName}`) ?? db.getAllCommunities().find(c => c.name === clusterName);
    if (!community) {
      // Try fuzzy match
      const all = db.getAllCommunities();
      const match = all.find(c => c.name.includes(clusterName) || c.id.includes(clusterName));
      if (match) {
        const nodes = db.getNodesByCommunity(match.id);
        const lines = [`# Community: ${match.name}`, "", `cohesion: ${match.cohesion}`, `symbols: ${match.symbolCount}`, ""];
        lines.push("## Members");
        for (const n of nodes.slice(0, 50)) {
          lines.push(`- [${n.type}] ${n.name} — ${n.filePath}:${n.line}`);
        }
        if (nodes.length > 50) lines.push(`... and ${nodes.length - 50} more`);
        return lines.join("\n");
      }
      return `# Unknown community: ${clusterName}`;
    }
    const nodes = db.getNodesByCommunity(community.id);
    const lines = [`# Community: ${community.name}`, "", `cohesion: ${community.cohesion}`, `symbols: ${community.symbolCount}`, ""];
    lines.push("## Members");
    for (const n of nodes.slice(0, 50)) {
      lines.push(`- [${n.type}] ${n.name} — ${n.filePath}:${n.line}`);
    }
    if (nodes.length > 50) lines.push(`... and ${nodes.length - 50} more`);
    return lines.join("\n");
  }

  if (parts[0] === "repo" && parts[2] === "process" && parts[3]) {
    const processName = parts[3];
    const process = db.getProcess(`proc_${processName}`) ?? db.getAllProcesses().find(p => p.id.includes(processName) || p.name.includes(processName));
    if (!process) {
      return `# Unknown process: ${processName}`;
    }
    const steps = (db as any).db.prepare(
      "SELECT uid, name, file_path, line, type FROM nodes WHERE process_name = ? ORDER BY line"
    ).all(process.id) as any[];

    const lines = [
      `# Process: ${process.name}`,
      "",
      `type: ${process.type}`,
      `entry_point: ${process.entryPointUid}`,
      `communities: [${process.communities.join(", ")}]`,
      "",
      "## Steps",
    ];
    for (const s of steps) {
      lines.push(`- [${s.type}] ${s.name} — ${s.file_path}:${s.line}`);
    }
    return lines.join("\n");
  }

  return `# Unknown resource: ${uri}`;
}
