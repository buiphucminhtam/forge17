---
name: memory-manager
description: >
  Persistent project memory using Graphiti (temporal knowledge graph) + FalkorDB.
  Temporal reasoning, entity extraction, relationship tracking, semantic search.
  Uses API-based LLM/Embeddings: OpenAI, Anthropic, Gemini, MiniMax.
---

# Memory Manager Skill

> **Purpose:** Give the AI agent persistent, searchable project memory with temporal
> reasoning — track what was discussed when, extract entities and relationships,
> and query historical context.

## When to Use

- **Session start** — auto-retrieve project context instead of re-reading entire codebase
- **Before answering** — query memory with task keywords for relevant decisions/blockers
- **After completing work** — store what was done, decisions made, blockers found
- **Periodic** — refresh project identity when major changes happen

## Memory Model

| Category | Examples | Weight (GC) |
|----------|----------|-------------|
| **decisions** | "Chose PostgreSQL because..." | 10 |
| **architecture** | "Using Next.js + Prisma + PostgreSQL" | 8 |
| **project** | "Forgewright v7.1 — 47 skills, 19 modes" | 8 |
| **blockers** | "Waiting on API key from vendor" | 7 |
| **session** | "Session completed: built auth module" | 6 |
| **tasks** | "BUILD complete: 3 services, 142 tests pass" | 5 |
| **conversation** | Extracted facts from summarized files | 4 |
| **general** | User-added notes | 4 |
| **git-activity** | Recent commit summaries | 3 |
| **ingested** | Chunked README/docs sections | 2 |

## CLI Commands

All commands use `scripts/graphiti-cli.py`:

```bash
# Setup - check dependencies and create graph
python3 scripts/graphiti-cli.py setup

# Add a memory (auto-extracts entities and relations)
python3 scripts/graphiti-cli.py add "Decided to use JWT + refresh tokens for auth" --category decisions

# Search with semantic similarity
python3 scripts/graphiti-cli.py search "authentication flow" --limit 5

# Temporal search - filter by time
python3 scripts/graphiti-cli.py search "architecture decisions" --when "last 30 days"
python3 scripts/graphiti-cli.py search "project changes" --when "in April 2026"

# Get entity history - timeline of mentions
python3 scripts/graphiti-cli.py history "Graphiti"
python3 scripts/graphiti-cli.py history "KuzuDB" --limit 20

# List all memories (with optional category filter)
python3 scripts/graphiti-cli.py list --category decisions

# Stats - graph statistics
python3 scripts/graphiti-cli.py stats

# Garbage collection
python3 scripts/graphiti-cli.py gc --max 100

# Health check
python3 scripts/graphiti-cli.py health
```

## Legacy Commands (mem0-cli)

The old `mem0-cli.py` is preserved for backward compatibility:

```bash
# These still work but use the old TF-IDF + JSONL system
python3 scripts/mem0-cli.py search "query" --limit 5
python3 scripts/mem0-cli.py add "text" --category decisions
```

## Migration

To migrate from mem0-cli to Graphiti:

```bash
# One-time migration of existing memories
python3 scripts/migrate-memory-to-graphiti.py --backup --verify

# Or use the built-in migrate command
python3 scripts/graphiti-cli.py migrate --dry-run  # preview
python3 scripts/graphiti-cli.py migrate            # execute
```

## Search — How It Works

Search uses **Graphiti's hybrid retrieval** combining:
- **Semantic search** — embeddings via API (OpenAI/Gemini/etc.)
- **Graph traversal** — entity relationships
- **Temporal filtering** — time-based queries

```
Query: "authentication"
→ Embed query → Find similar facts → Filter by time (--when)
→ Return results with entity context
```

**Temporal Queries:**
- `--when "last 7 days"` — last week
- `--when "last 30 days"` — last month
- `--when "in April 2026"` — specific month

**NEW: Entity History:**
```bash
graphiti-cli.py history "KuzuDB"
```
Returns all mentions of "KuzuDB" ordered by time, with extracted relationships.

## Token Optimization Strategy

### When to Retrieve
1. **Always** at session start — search with project name + request keywords, limit to top-5
2. **Before complex tasks** — search with task keywords, limit to top-3
3. **At gate decisions** — fetch relevant decisions/blockers

### Token Budget
- Retrieval output: max **500 tokens** (configurable via `MEM0_MAX_TOKENS`)
- Total memory injection per prompt: **800 tokens** ceiling

## Safety

### Secret Redaction
The CLI automatically redacts patterns matching:
- API keys (`sk-*`, `key-*`, Bearer tokens)
- Passwords, secrets, tokens (configurable regex)
- Database connection strings with credentials

### .memignore
Create `.memignore` at project root to exclude files/folders from ingestion.

### Opt-out
- Set `MEM0_DISABLED=true` to skip all memory operations

## Configuration

### Graphiti (Primary)

```bash
# LLM Provider (supports: openai, anthropic, gemini, minimax)
GRAPHITI_LLM_PROVIDER=openai
GRAPHITI_API_KEY=sk-...                    # API key for LLM
GRAPHITI_BASE_URL=https://api.openai.com/v1  # Custom endpoint (optional)
GRAPHITI_LLM_MODEL=gpt-4o-mini             # Model to use

# Embedding config
GRAPHITI_EMBED_PROVIDER=openai
GRAPHITI_EMBED_API_KEY=sk-...              # API key for embeddings
GRAPHITI_EMBED_MODEL=text-embedding-3-small

# FalkorDB connection
FALKORDB_HOST=localhost
FALKORDB_PORT=6379

# Graph settings
GRAPHITI_REDACT_SECRETS=true    # Auto-redact API keys, passwords
```

### Legacy (mem0-cli)

```bash
# Storage (JSONL, git-committed)
MEM0_PROJECT_ID=my-project        # namespace for multi-project

# Limits
MEM0_MAX_TOKENS=500               # max tokens per retrieval
MEM0_MAX_MEMORIES=200             # max stored memories before GC

# Safety
MEM0_REDACT_SECRETS=true          # auto-redact API keys, passwords
MEM0_DISABLED=false               # set true to skip all ops
```

## Integration with Forgewright Pipeline

### Active Lifecycle Hooks

The orchestrator calls memory-manager at specific lifecycle points. All hooks are wired with exact CLI commands in `skills/_shared/protocols/session-lifecycle.md`:

| Hook | Trigger | Memory Command |
|------|---------|---------------|
| `SESSION_START` | Pipeline begins | `search "<project> <keywords>" --limit 5` |
| `TURN_CLOSE` | After every user request is answered | **Mandatory** `add "REQ:… | DONE:… | OPEN:…" --category session` (+ optional `decisions` / `architecture` / `blockers`). See session-lifecycle §Per-request memory. |
| `PHASE_COMPLETE` | After DEFINE/BUILD/HARDEN/SHIP | `add "Phase [name]: [summary]" --category tasks` |
| `GATE_DECISION` | After Gate 1/2/3 | `add "Gate [N] [decision]: [feedback]" --category decisions` |
| `SESSION_END` | Pipeline completes | `add "Session completed: [summary]" --category session` |
| `ERROR` | Task failure/escalation | `add "BLOCKER: [task] failed: [details]" --category blockers` |

### Temporal Context

**NEW with Graphiti:** Query historical context with time filters:

```bash
# What architecture decisions were made last month?
graphiti-cli.py search "architecture decision" --when "last 30 days" --category decisions

# Timeline of a specific topic
graphiti-cli.py history "Graphiti"
```

### Context Integration with Project Profile

Memory works alongside `.forgewright/project-profile.json`:
- **Project Profile** = structural facts (stack, health, patterns) — always loaded
- **Memory** = temporal facts (decisions, blockers, progress) — searched contextually
- Together they provide full project context without re-scanning

### BA Integration

When the Business Analyst skill completes:
- BA outputs (`ba-package.md`, requirements register) are referenced by memory
- PM reads BA package directly — memory stores the decision "BA validated requirements"
- Gate 1 stores BRD approval decision for future sessions

### Manual Usage

Any skill can invoke memory commands directly:
```bash
# Before starting work
python3 scripts/mem0-cli.py search "current task" --limit 3 --format compact

# After completing work
python3 scripts/mem0-cli.py add "Completed: auth module with JWT + refresh tokens" --category decisions
```

## Garbage Collection — Value-Weighted

GC scores each entry: `category_weight × recency_factor`, then prunes lowest-scored:

| Category | Weight | Rationale |
|----------|--------|-----------|
| decisions | 10 | Most valuable — architecture choices persist |
| architecture | 8 | Stack identity rarely changes |
| project | 8 | Core project facts |
| blockers | 7 | Active impediments need attention |
| session | 6 | Recent work history |
| tasks | 5 | Phase completion status |
| conversation | 4 | Summarized context |
| general | 4 | User notes |
| git-activity | 3 | Easily re-ingested |
| ingested | 2 | Easily re-ingested from source files |

Recency factor: today=1.0, 30 days ago=0.7, 90+ days ago=0.1.

## File Layout

```
forgewright/
├── skills/memory-manager/
│   └── SKILL.md              ← this file
├── scripts/
│   ├── graphiti-cli.py       ← CLI tool (Graphiti + FalkorDB + API)
│   ├── graphiti_client.py    ← Graphiti client wrapper
│   ├── migrate-memory-to-graphiti.py  ← Migration script
│   ├── setup-graphiti.sh     ← API configuration setup
│   └── mem0-cli.py           ← Legacy CLI (TF-IDF + JSONL)
├── requirements-graphiti.txt  ← Graphiti dependencies
├── docker-compose.graphiti.yml ← FalkorDB container
├── .memignore                ← exclusion patterns
└── .forgewright/
    ├── memory.jsonl          ← Legacy storage (can be archived after migration)
    ├── project-profile.json  ← project fingerprint (committed)
    ├── code-conventions.md   ← detected patterns (committed)
    └── session-log.json      ← session history (gitignored)
```

## Dependencies

### Infrastructure (Docker)
- **FalkorDB** — Graph database (run via docker-compose.graphiti.yml)

### Python Packages
```bash
pip install -r requirements-graphiti.txt
```

Required packages:
- `graphiti-core[falkordb]` — Temporal knowledge graph
- `falkordb` — FalkorDB Python client

### API Keys
Set one of:
- `GRAPHITI_API_KEY` — Direct API key
- `OPENAI_API_KEY` — OpenAI key (fallback)
- `ANTHROPIC_API_KEY` — Anthropic key
- `GEMINI_API_KEY` — Google Gemini key
- `MINIMAX_API_KEY` — MiniMax key
