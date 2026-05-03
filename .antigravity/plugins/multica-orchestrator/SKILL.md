# Multica Orchestrator — SKILL.md

> Multi-agent orchestration with mmx-cli (Minimax) as the primary orchestration engine

## Overview

The **Multica Orchestrator** is an Antigravity plugin that coordinates multiple AI agents (mmx-cli/Minimax, Claude Code, and Cursor Agent) for complex, multi-component software development tasks. It provides a unified command interface for spawning, managing, and orchestrating parallel agent workflows.

## Quick Start

```bash
# Start the orchestrator daemon
multica daemon start

# Create a new orchestration task
multica task create --name "feature-build" --agents "architect,engineer,qa"

# List active tasks
multica task list

# Run a task with all assigned agents
multica task run "feature-build"
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Multica Orchestrator                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  mmx-cli    │  │  Claude     │  │  Cursor Agent           │  │
│  │  (Primary)  │  │  Code       │  │  (Secondary)             │  │
│  │             │  │             │  │                          │  │
│  │  Minimax    │  │  Anthropic  │  │  Cursor IDE             │  │
│  │  MoE Model  │  │  Claude     │  │  Integration             │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬──────────────┘  │
│         │                │                      │                 │
│         └────────────────┼──────────────────────┘                 │
│                          ▼                                        │
│              ┌───────────────────────┐                           │
│              │   Task Coordinator    │                           │
│              │   (mmx-cli daemon)    │                           │
│              └───────────┬───────────┘                           │
│                          │                                        │
│         ┌────────────────┼────────────────┐                      │
│         ▼                ▼                ▼                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │  Worktree 1 │  │  Worktree 2 │  │  Worktree N │               │
│  │  (Agent A)  │  │  (Agent B)  │  │  (Agent N)  │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Commands

### Daemon Management

| Command | Description | Example |
|---------|-------------|---------|
| `daemon start` | Start the orchestrator daemon in background | `multica daemon start` |
| `daemon stop` | Stop the running daemon gracefully | `multica daemon stop` |
| `daemon status` | Check daemon health and active connections | `multica daemon status` |
| `daemon restart` | Restart the daemon (stop + start) | `multica daemon restart` |

```bash
# Start daemon with verbose logging
multica daemon start --verbose

# Check status with detailed output
multica daemon status --json

# Force stop if stuck
multica daemon stop --force
```

### Task Management

| Command | Description | Example |
|---------|-------------|---------|
| `task create` | Create a new orchestration task | `multica task create --name "build-api"` |
| `task list` | List all tasks (active, completed, failed) | `multica task list` |
| `task run` | Execute a task with assigned agents | `multica task run "build-api"` |
| `task status` | Get detailed status of a task | `multica task status "build-api"` |
| `task cancel` | Cancel a running task | `multica task cancel "build-api"` |
| `task delete` | Remove a task from the registry | `multica task delete "build-api"` |
| `task log` | Stream logs from a task | `multica task log "build-api"` |

```bash
# Create task with multiple agents and worktree allocation
multica task create \
  --name "feature-payment" \
  --agents "architect,engineer,qa" \
  --worktrees 3 \
  --timeout 3600

# List tasks with filtering
multica task list --status running --format table

# Run with custom agent configuration
multica task run "feature-payment" \
  --agents.architect "mmx" \
  --agents.engineer "claude" \
  --agents.qa "cursor"
```

### Agent Management

| Command | Description | Example |
|---------|-------------|---------|
| `agents list` | List all available agents and their status | `multica agents list` |
| `agents info` | Show detailed info about a specific agent | `multica agents info mmx` |
| `agents spawn` | Manually spawn an agent instance | `multica agents spawn --type mmx --name "builder-1"` |
| `agents kill` | Terminate a running agent | `multica agents kill builder-1` |
| `agents health` | Check health of all agent types | `multica agents health` |

```bash
# List all agents with status
multica agents list --verbose

# Get info about mmx-cli agent
multica agents info mmx --config

# Spawn a new agent instance
multica agents spawn --type mmx --name "backend-builder" --memory 8G

# Check agent health across all types
multica agents health
```

## Usage Patterns

### Pattern 1: Full-Stack Feature Development

```bash
# Step 1: Create orchestration task
multica task create \
  --name "user-auth-feature" \
  --agents "architect,frontend,backend,qa" \
  --worktrees 4

# Step 2: Run the task (orchestrates parallel agent execution)
multica task run "user-auth-feature"

# Step 3: Monitor progress
multica task log "user-auth-feature" --follow
```

### Pattern 2: Parallel Agent Execution

```bash
# Create task with worktree-per-agent mapping
multica task create \
  --name "microservices-refactor" \
  --agents "architect,engineer-1,engineer-2,qa,devops" \
  --worktrees 5 \
  --parallel true

# Execute
multica task run "microservices-refactor"
```

### Pattern 3: Multi-Agent Code Review

```bash
multica task create \
  --name "security-audit" \
  --agents "security,swe,qa" \
  --worktrees 3

multica task run "security-audit" \
  --scope "auth,payments,data-handling"
```

### Pattern 4: Claude Code Integration

```bash
# Use Claude Code as primary agent for complex reasoning
multica task create \
  --name "architecture-design" \
  --agents "claude" \
  --claude-model "claude-opus-4"

multica task run "architecture-design" \
  --prompt "Design a scalable microservices architecture for..."

# Or combine with mmx-cli for parallel execution
multica task create \
  --name "full-review" \
  --agents "claude,mmx" \
  --worktrees 2

multica task run "full-review"
```

### Pattern 5: Cursor Agent Coordination

```bash
# Spawn Cursor Agent for IDE-integrated work
multica agents spawn --type cursor --name "ide-builder"

# Coordinate with other agents
multica task create \
  --name "ide-integration" \
  --agents "mmx,cursor" \
  --worktrees 2

multica task run "ide-integration"
```

## Configuration

### Global Configuration (`~/.multica/config.yaml`)

```yaml
daemon:
  port: 7890
  host: localhost
  log_level: info
  max_concurrent_tasks: 10

agents:
  mmx:
    binary_path: /usr/local/bin/mmx-cli
    model: minimax/moonshot
    memory_limit: 16G
    timeout: 3600

  claude:
    model: claude-opus-4
    max_tokens: 8192
    timeout: 1800

  cursor:
    workspace_root: ~/projects
    auto_save: true

worktree:
  base_path: /tmp/multica-worktrees
  cleanup_on_completion: true
  max_age_hours: 24

notifications:
  enabled: true
  on_complete: true
  on_failure: true
```

### Task-Level Configuration

```yaml
# .multica/task.yaml in project root
task:
  name: my-feature
  agents:
    - architect
    - frontend
    - backend
    - qa

  worktrees:
    architect: 1
    frontend: 1
    backend: 2
    qa: 1

  timeout: 7200

  hooks:
    pre_run: ./scripts/pre-check.sh
    post_complete: ./scripts/notify.sh
```

## Integration

### Cursor IDE Integration

The Multica Orchestrator integrates seamlessly with Cursor IDE:

1. **Agent Spawning**: Spawn Cursor Agent instances directly from the orchestrator
2. **Task Coordination**: Assign Cursor Agent as part of multi-agent workflows
3. **Worktree Isolation**: Each agent works in its own git worktree
4. **File Sync**: Changes sync back to the main repository on completion

```bash
# In Cursor terminal
multica task create --name "cursor-task" --agents "cursor,mmx"

# Cursor Agent handles IDE-specific work
# mmx-cli handles backend processing
multica task run "cursor-task"
```

### Antigravity Integration

Multica Orchestrator is an Antigravity plugin that:

- Loads automatically when Antigravity initializes
- Participates in the `INTERPRET → DEFINE → BUILD → HARDEN → SHIP → SUSTAIN` pipeline
- Can be invoked via the orchestrator skill for complex multi-agent tasks
- Shares context via the Antigravity context store

```bash
# Via Antigravity
antigravity run --plugin multica-orchestrator --task "full-stack-build"
```

### ForgeNexus Integration

ForgeNexus provides code intelligence for the orchestrator:

1. **Impact Analysis**: Run `forgenexus_impact()` before agent edits
2. **Change Detection**: Verify changes match expected scope
3. **Symbol Tracking**: Monitor which agents modified which symbols

```bash
# Before task execution, analyze scope
forgenexus_query({query: "auth module dependencies"})

# After completion, verify changes
forgenexus_detect_changes({scope: "all"})
```

## API Reference

### Daemon API (localhost:7890)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Daemon health status |
| `/tasks` | GET | List all tasks |
| `/tasks` | POST | Create new task |
| `/tasks/:id` | GET | Get task details |
| `/tasks/:id` | DELETE | Delete task |
| `/tasks/:id/run` | POST | Run task |
| `/tasks/:id/cancel` | POST | Cancel task |
| `/agents` | GET | List agents |
| `/agents/:type/spawn` | POST | Spawn agent |
| `/agents/:id/kill` | POST | Kill agent |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Daemon not running |
| 3 | Task not found |
| 4 | Agent unavailable |
| 5 | Timeout |
| 6 | Configuration error |
| 7 | Permission denied |

## Troubleshooting

### Daemon Won't Start

```bash
# Check if port is in use
lsof -i :7890

# Check logs
cat ~/.multica/logs/daemon.log

# Clear lock file
rm ~/.multica/locks/daemon.lock
```

### Agent Not Responding

```bash
# Check agent health
multica agents health

# Restart specific agent
multica agents kill <agent-id>
multica agents spawn --type <type> --name <name>
```

### Task Stuck

```bash
# Cancel and retry
multica task cancel <task-id>
multica task run <task-id> --force

# Or manually cleanup
multica task delete <task-id>
```

## Best Practices

1. **Worktree Isolation**: Always use separate worktrees per agent to prevent conflicts
2. **Timeout Configuration**: Set appropriate timeouts based on task complexity
3. **Health Monitoring**: Regularly check agent health with `multica agents health`
4. **Cleanup**: Remove completed tasks to keep the registry clean
5. **Configuration**: Use task-level configs for project-specific settings
6. **Logging**: Enable verbose logging during development, info in production

## See Also

- [mmx-cli Documentation](https://minimax.io/mmx-cli) — Primary agent documentation
- [Antigravity Plugins](../plugins/) — Other available plugins
- [ForgeNexus Integration](../forgenexus/) — Code intelligence
- [Worktree Manager](../../scripts/worktree-manager.sh) — Git worktree utilities
