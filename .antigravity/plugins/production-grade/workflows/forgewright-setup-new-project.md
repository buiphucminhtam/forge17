# Forgewright Setup — New Project (Greenfield)

> Copy & paste this prompt to set up Forgewright in a brand-new project.

---

## Prompt

```
I want to set up Forgewright in a brand new project from scratch.
Please do the following in order:

## Step 1 — Initialize Git

Run:
```bash
git init
git add .
git commit -m "chore: initial commit"
```

## Step 2 — Install Forgewright as git submodule

```bash
git submodule add -b main https://github.com/buiphucminhtam/forgewright.git .antigravity/plugins/production-grade
git submodule update --init --recursive
```

## Step 3 — Copy required files to project root

```bash
cp .antigravity/plugins/production-grade/AGENTS.md AGENTS.md
cp .antigravity/plugins/production-grade/CLAUDE.md CLAUDE.md
cp .antigravity/plugins/production-grade/README.md FORGEWRIGHT.md
```

## Step 4 — Commit

```bash
git add .gitmodules .antigravity AGENTS.md CLAUDE.md FORGEWRIGHT.md
git commit -m "feat: add Forgewright v7.8 — 52 skills, ForgeNexus, MCP"
```

## Step 5 — Power Level Setup

### Level 1 (already done above) — Basic
52 skills + full pipeline. Nothing extra needed.

### Level 2 — Smart (ForgeNexus code intelligence)
**What you get:** Ask "what breaks if I change this function?" — instant blast-radius analysis.
**Requires:** Node.js 18+

Run:
```bash
cd .antigravity/plugins/production-grade
npm install && npm run build
cd ../..

# Index your project
npx forgenexus analyze "$(pwd)"

# Verify
npx forgenexus status "$(pwd)"
```

### Level 3 — Persistent Memory (Cross-session context)
**What you get:** The orchestrator remembers decisions, architecture, blockers across sessions.
**Requires:** Python 3.8+

Run:
```bash
FORGEWRIGHT_ROOT="$(pwd)/.antigravity/plugins/production-grade"
bash "$FORGEWRIGHT_ROOT/scripts/ensure-mem0.sh" "$(pwd)"
ls .forgewright/memory.jsonl   # must exist
python3 "$FORGEWRIGHT_ROOT/scripts/mem0-cli.py" refresh
```

### Level 4 — MCP Tools (12 ForgeNexus tools in AI chat)
**What you get:** `query`, `context`, `impact`, `detect_changes`, `rename`, `cypher`, `route_map`, `tool_map`, `shape_check`, `api_impact`, `pr_review`, `list_repos`
**Requires:** Step 2 + Step 3

Run:
```bash
cd .antigravity/plugins/production-grade
bash scripts/mcp-generate.sh
```

Then add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "forgenexus": {
      "command": "node",
      "args": [".antigravity/plugins/production-grade/forgenexus/dist/cli/index.js", "mcp", "$(pwd)"]
    }
  }
}
```
Restart Cursor after adding the config.

## Step 6 — Verify Full Setup

```bash
FW_ROOT="$(pwd)/.antigravity/plugins/production-grade"
echo "=== Forgewright Power Level Check ==="
echo "Skills: $(ls "$FW_ROOT/skills" -1 2>/dev/null | wc -l | tr -d ' ') / 52"
echo "ForgeNexus: $([ -f "$FW_ROOT/forgenexus/dist/cli/index.js" ] && echo '✓ built' || echo '✗ missing')"
echo "MCP server: $([ -d ".forgewright/mcp-server" ] && echo '✓ generated' || echo '✗ missing')"
echo "Memory: $([ -f ".forgewright/memory.jsonl" ] && echo '✓ initialized' || echo '✗ missing')"
echo "ForgeNexus indexed: $([ -d ".forgenexus" ] && echo '✓ yes' || echo '✗ run: npx forgenexus analyze')"
echo "======================================="
```

## Step 7 — Optional Enhancements

### AI Vision Testing (for mobile testing)
```bash
npm install -g @anthropic-ai/midscene
```

### Web Scraping
```bash
pip install "crawl4ai>=0.8.0"
```

## You're Ready!

Try these commands:
- "Build a production-grade SaaS for [your idea]"
- "Help me think about [your idea]"
- "Add [feature] to my project"
- "Review my code"

Or use workflow shortcuts:
- `/setup` — Re-run installation
- `/onboard` — Deep project analysis (creates `.forgewright/project-profile.json`)
- `/pipeline` — Show full pipeline reference
- `/mcp` — Regenerate MCP config
```

---

## What This Sets Up

| Component | Files Created |
|-----------|--------------|
| **52 Skills** | `.antigravity/plugins/production-grade/skills/` |
| **Orchestrator** | `CLAUDE.md`, `AGENTS.md`, `FORGEWRIGHT.md` |
| **ForgeNexus (Level 2)** | `.forgenexus/` — indexed code graph |
| **Memory (Level 3)** | `.forgewright/memory.jsonl` — persistent cross-session memory |
| **MCP Tools (Level 4)** | `~/.cursor/mcp.json` — 12 ForgeNexus tools in AI chat |

## Power Levels Summary

| Level | What You Get |
|-------|-------------|
| **1** | 52 skills, full pipeline (BA→PM→Architect→BE→FE→QA→Security→DevOps→SRE) |
| **2** | + ForgeNexus code intelligence — blast-radius analysis, call chains, impact |
| **3** | + Persistent memory — cross-session context, remembers decisions |
| **4** | + 12 MCP tools — `query`, `context`, `impact`, `rename`, `cypher`, etc. |
