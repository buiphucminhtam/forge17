---
description: First-time setup of Forgewright as a git submodule in your project
---

# Setup Forgewright

> **New project?** → Use **forgewright-setup-new-project.md** (workflows/)
> **Existing project?** → Use **forgewright-setup-existing-project.md** (workflows/)
> Both prompts include the full setup: submodule + Power Levels + verification.

## Quick Setup (basic — Level 1 only)

1. Add as git submodule:
```bash
git submodule add -b main https://github.com/buiphucminhtam/forgewright.git .antigravity/plugins/production-grade
git submodule update --init --recursive
```

2. Copy required files:
```bash
cp .antigravity/plugins/production-grade/AGENTS.md AGENTS.md
cp .antigravity/plugins/production-grade/CLAUDE.md CLAUDE.md
cp .antigravity/plugins/production-grade/README.md FORGEWRIGHT.md
```

3. Commit:
```bash
git add .gitmodules .antigravity/ AGENTS.md CLAUDE.md FORGEWRIGHT.md
git commit -m "feat: add Forgewright v7.8 — 52 skills, ForgeNexus, MCP"
```

4. Verify:
```bash
cat .antigravity/plugins/production-grade/VERSION    # should be 7.8.0
ls .antigravity/plugins/production-grade/skills/ | wc -l   # should be 52
```

## Full Setup (recommended)

See the dedicated workflow files:

| Scenario | File |
|----------|------|
| **New project (greenfield)** | `workflows/forgewright-setup-new-project.md` |
| **Existing project (brownfield)** | `workflows/forgewright-setup-existing-project.md` |

Each includes all 4 Power Levels + verification + optional enhancements.

## Power Levels

| Level | What You Get |
|-------|-------------|
| **1** | 52 skills, full pipeline (BA→PM→Architect→BE→FE→QA→Security→DevOps→SRE) |
| **2** | + ForgeNexus code intelligence — blast-radius analysis, call chains |
| **3** | + Persistent memory — cross-session context |
| **4** | + 12 MCP tools — `query`, `context`, `impact`, `rename`, `cypher`, etc. |

## After Setup

You're ready to go! Try:
- "Build a production-grade SaaS for [your idea]"
- "Help me think about [your idea]"
- "Add [feature] to my project"
- "Review my code"
- "Write tests for this project"

Or use workflow shortcuts:
- `/setup` — Re-run installation
- `/onboard` — Deep project analysis (creates `.forgewright/project-profile.json`)
- `/pipeline` — Show full pipeline reference
- `/mcp` — Regenerate MCP config
- `/update` — Check for new Forgewright versions
