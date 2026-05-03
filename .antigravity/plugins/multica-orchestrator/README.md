# Multica Orchestrator

A multi-agent orchestration system for Forgewright that coordinates Claude Code, Cursor Agent, and other AI assistants to work together on complex software development tasks.

## Overview

Multica provides intelligent task distribution, real-time progress tracking, and seamless coordination between multiple AI agents. Built on mmx-cli for process isolation and WebSocket-based communication for real-time updates.

**Key Features:**
- Task queue with priority-based scheduling
- Real-time progress streaming
- Agent health monitoring
- WebSocket-based daemon architecture
- Rich terminal UI with live updates

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+ (for mmx-cli)
- npm or pip

### Install mmx-cli

```bash
npm install -g mmx-cli
```

### Install Multica

**From source:**

```bash
git clone https://github.com/your-org/forgewright.git
cd forgewright/.antigravity/plugins/multica-orchestrator
pip install -e .
```

**Or via pip:**

```bash
pip install forgewright-multica
```

### Verify Installation

```bash
multica --version
```

## Quick Start

### 1. Start the Daemon

```bash
multica daemon start
```

For background operation:

```bash
multica daemon start --background
```

### 2. Create a Task

```bash
multica task create "Build user authentication" \
  --description "Implement JWT-based auth with refresh tokens" \
  --priority high \
  --skills "security-engineer,backend-engineer"
```

### 3. List Tasks

```bash
multica task list
```

### 4. Run a Task

```bash
multica task run 1 --agent engineer
```

### 5. View Available Agents

```bash
multica agents list
```

### 6. Open Board UI

```bash
multica board
```

## Commands

### Daemon Commands

```bash
multica daemon start [--host HOST] [--port PORT] [--background]
multica daemon stop
multica daemon status
```

| Option | Description | Default |
|--------|-------------|---------|
| `--host` | Host to bind to | `localhost` |
| `--port` | Port to bind to | `8765` |
| `--background`, `-b` | Run in background | `false` |

### Task Commands

```bash
multica task create <title> [OPTIONS]
multica task list [--status STATUS]
multica task status <id>
multica task run <id> [--agent AGENT]
```

**Create Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--description`, `-d` | Task description | None |
| `--priority`, `-p` | Priority level (low, medium, high, critical) | `medium` |
| `--skills`, `-s` | Comma-separated skill IDs | None |

**List Options:**

| Option | Description |
|--------|-------------|
| `--status`, `-s` | Filter by status (pending, in_progress, completed, failed) |

**Run Options:**

| Option | Description |
|--------|-------------|
| `--agent`, `-a` | Specific agent to assign |

### Agent Commands

```bash
multica agents list
```

Lists all available agents with their skills and current status.

### Board Command

```bash
multica board
```

Opens the web-based Kanban board UI in your default browser at `http://localhost:8766`.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MULTICA_DAEMON_HOST` | Daemon bind host | `localhost` |
| `MULTICA_DAEMON_PORT` | Daemon port | `8765` |
| `MULTICA_BOARD_PORT` | Board UI port | `8766` |
| `MULTICA_LOG_LEVEL` | Logging level | `INFO` |

### Configuration File

Create `~/.multica/config.yaml`:

```yaml
daemon:
  host: localhost
  port: 8765

board:
  port: 8766

agents:
  max_concurrent: 4
  health_check_interval: 30

logging:
  level: INFO
  format: json
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Multica CLI                           │
├─────────────────────────────────────────────────────────────┤
│  multica daemon | task | agents | board                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ WebSocket
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     Multica Daemon                           │
├──────────────────┬──────────────────┬────────────────────────┤
│  Task Queue      │  Agent Manager  │  Progress Streamer     │
│  - Priority      │  - Health       │  - Real-time updates   │
│  - Scheduling    │  - Assignment    │  - Event emission      │
└──────────────────┴──────────────────┴────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Claude   │ │ Cursor   │ │ mmx-cli  │
    │ Code     │ │ Agent    │ │ Workers  │
    └──────────┘ └──────────┘ └──────────┘
```

### Components

**Multica Daemon**
- Central coordination hub
- WebSocket server for real-time communication
- Task scheduling and agent management
- Progress streaming to connected clients

**Task Queue**
- Priority-based task scheduling
- Task state management (pending, in_progress, completed, failed)
- Skill-based agent matching
- Retry logic for failed tasks

**Agent Manager**
- Agent registration and heartbeat monitoring
- Skill catalog management
- Load balancing across agents
- Health checks and failover

**Progress Streamer**
- Real-time progress updates via WebSocket
- SSE fallback for browser clients
- Event aggregation and batching

**mmx Executor**
- Isolated process execution via mmx-cli
- Environment management per agent
- Resource limits and timeouts
- Output streaming

## Troubleshooting

### Daemon Issues

**Daemon won't start:**
```bash
# Check if port is in use
lsof -i :8765

# Try a different port
multica daemon start --port 8767
```

**Can't connect to daemon:**
```bash
# Verify daemon is running
multica daemon status

# Check environment variables
echo $MULTICA_DAEMON_HOST
echo $MULTICA_DAEMON_PORT

# Restart daemon
multica daemon stop
multica daemon start
```

### Task Issues

**Task stuck in pending:**
```bash
# Check agent availability
multica agents list

# Manually assign agent
multica task run <id> --agent <agent-id>
```

**Task failed:**
```bash
# View task details
multica task status <id>

# Retry task
multica task run <id>
```

### mmx-cli Issues

**mmx-cli not found:**
```bash
# Reinstall mmx-cli
npm install -g mmx-cli

# Verify installation
mmx --version
```

**Process isolation errors:**
```bash
# Check mmx-cli configuration
mmx config list

# Reset mmx state
mmx reset
```

### Board UI Issues

**Board won't open:**
```bash
# Manually start board server
cd .antigravity/plugins/board-ui
npm run dev

# Access at http://localhost:3000
```

## License

MIT License

Copyright (c) 2024 Forgewright

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
