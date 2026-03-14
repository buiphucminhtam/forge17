---
name: memory-manager
description: >
  Mem0-powered persistent memory layer for project context. Stores durable
  knowledge (goals, architecture, decisions, blockers, task status) and retrieves
  it to reduce token usage. Supports ingestion from git, README, notes, and
  conversation summaries.
---

# Memory Manager Skill

> **Purpose:** Give the AI agent persistent, searchable project memory so it
> doesn't re-discover the same context every session. Token-efficient: retrieve
> only what's relevant, compress the rest.

## When to Use

- **Session start** — auto-retrieve project context instead of re-reading entire codebase
- **Before answering** — query memory with task keywords for relevant decisions/blockers
- **After completing work** — store what was done, decisions made, blockers found
- **Periodic** — summarize long conversations into compact structured memory

## Memory Model

| Category | Examples | Auto-ingested From |
|----------|----------|-------------------|
| **Project goals** | "Building a SaaS for X" | README, VISION.md |
| **Architecture** | "Using Next.js + Prisma + PostgreSQL" | README, code structure |
| **Task status** | TODO/DOING/DONE items | Git history, task files |
| **Blockers** | "Waiting on API key from vendor" | Conversation summaries |
| **Decisions** | "Chose PostgreSQL over MongoDB because..." | Conversation summaries |
| **Key commands** | "Deploy: `railway up`" | README, scripts |
| **Environment** | "Node 22, macOS, Railway hosting" | package.json, setup files |

## CLI Commands

All commands use `scripts/mem0-cli.py`:

```bash
# Search memory (most common — use before answering)
python3 scripts/mem0-cli.py search "authentication flow"

# Add a memory manually
python3 scripts/mem0-cli.py add "Decided to use JWT + refresh tokens for auth"

# Ingest from files (README, VISION, notes)
python3 scripts/mem0-cli.py ingest README.md VISION.md

# Ingest from recent git history
python3 scripts/mem0-cli.py ingest-git --days 7

# Summarize and compress a conversation log
python3 scripts/mem0-cli.py summarize path/to/conversation.md

# List all memories (with optional category filter)
python3 scripts/mem0-cli.py list --category decisions

# Delete a specific memory
python3 scripts/mem0-cli.py delete <memory_id>

# Export all memories to markdown
python3 scripts/mem0-cli.py export > project-memory.md

# Stats: token usage, memory count, categories
python3 scripts/mem0-cli.py stats
```

## Token Optimization Strategy

### When to Retrieve
1. **Always** at session start — fetch top-5 project context memories
2. **Before complex tasks** — search with task keywords, limit to top-3
3. **At gate decisions** — fetch relevant decisions/blockers

### When to Summarize
1. After every **completed pipeline phase** (DEFINE, BUILD, etc.)
2. When conversation exceeds **~4000 tokens** of accumulated context
3. On explicit `/summarize` command

### Token Budget
- Retrieval output: max **500 tokens** (configurable via `MEM0_MAX_TOKENS`)
- Summarization input: chunks of **2000 tokens** max
- Total memory injection per prompt: **800 tokens** ceiling

## Safety

### Secret Redaction
The CLI automatically redacts patterns matching:
- API keys (`sk-*`, `key-*`, Bearer tokens)
- Passwords, secrets, tokens (configurable regex)
- Database connection strings with credentials

### .memignore
Create `.memignore` at project root to exclude files/folders from ingestion:
```
# Exclude sensitive files
.env
.env.*
secrets/
credentials/
**/node_modules/**
```

### Opt-out
- Set `MEM0_DISABLED=true` to skip all memory operations
- Individual files can be excluded via `.memignore`

## Configuration

Environment variables (in `.env` or shell):

```bash
# Required: LLM for memory extraction/summarization
MEM0_LLM_PROVIDER=openai          # openai, ollama, anthropic
MEM0_LLM_MODEL=gpt-4.1-nano      # or ollama model name
MEM0_LLM_API_KEY=sk-...           # not needed for ollama

# Optional: Ollama local (recommended for privacy)
MEM0_LLM_PROVIDER=ollama
MEM0_LLM_MODEL=llama3.2
MEM0_LLM_BASE_URL=http://localhost:11434

# Storage (default: local SQLite)
MEM0_STORE=sqlite                 # sqlite, chroma, pgvector
MEM0_DB_PATH=.forge17/memory.db   # for sqlite

# Limits
MEM0_MAX_TOKENS=500               # max tokens per retrieval
MEM0_MAX_MEMORIES=100             # max stored memories per project
MEM0_PROJECT_ID=my-project        # namespace for multi-project

# Safety
MEM0_REDACT_SECRETS=true          # auto-redact API keys, passwords
```

## Integration with Forge17 Pipeline (v7.0)

### Active Lifecycle Hooks

The orchestrator now calls memory-manager at specific lifecycle points via `skills/_shared/protocols/session-lifecycle.md`:

| Hook | Trigger | Memory Action |
|------|---------|---------------|
| `SESSION_START` | Pipeline begins | `search <project>` → retrieve top-5 context (max 800 tokens) |
| `PHASE_COMPLETE` | After DEFINE/BUILD/HARDEN/SHIP/SUSTAIN | `add "Phase [name] completed: [summary]"` |
| `TASK_COMPLETE` | After each T1-T11 task | `add "Task [id]: [summary]"` (decisions, blockers only) |
| `GATE_DECISION` | After Gate 1/2/3 | `add "Gate [N] [decision]: [feedback]"` |
| `SESSION_END` | Pipeline completes or interrupts | `add "Session [id]: [full summary]. Next: [steps]"` |
| `ERROR` | Task failure/escalation | `add "BLOCKER: [task] failed: [details]"` |

### Context Integration with Project Profile

Memory works alongside `.forge17/project-profile.json`:
- **Project Profile** = structural facts (stack, health, patterns) — always loaded
- **Memory** = temporal facts (decisions, blockers, progress) — searched contextually
- Together they provide full project context without re-scanning

### Manual usage
Any skill can invoke memory commands directly:
```bash
# Before starting work
CONTEXT=$(python3 scripts/mem0-cli.py search "current task" --format compact)
# ... use $CONTEXT in prompt ...

# After completing work
python3 scripts/mem0-cli.py add "Completed: auth module with JWT + refresh tokens"
```

## Storage Backends

| Backend | Setup | Best For |
|---------|-------|----------|
| **SQLite** (default) | Zero config | Single dev, local-first |
| **ChromaDB** | `pip install chromadb` | Better semantic search |
| **pgvector** | Requires PostgreSQL | Team/production use |

## File Layout

```
forge17/
├── skills/memory-manager/
│   └── SKILL.md              ← this file
├── scripts/
│   └── mem0-cli.py           ← CLI tool
├── .memignore                ← exclusion patterns
└── .forge17/
    ├── project-profile.json  ← project fingerprint (committed)
    ├── code-conventions.md   ← detected patterns (committed)
    ├── session-log.json      ← session history (gitignored)
    ├── quality-history.json  ← quality trending (gitignored)
    ├── quality-metrics.json  ← current session metrics (gitignored)
    ├── memory.db             ← SQLite store (gitignored)
    └── .gitignore            ← auto-generated
```
