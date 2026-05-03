# Forgewright Board UI

> Real-time Kanban board for task management with mmx-cli, Claude Code, and Cursor Agent

## Overview

Board UI is a real-time collaborative Kanban board plugin for Forgewright that provides visual task management across multiple agents and team members. It integrates with the multica-orchestrator for distributed task coordination and supports drag-and-drop task management.

## Features

### Core Features

- **Drag-and-Drop Task Management** — Intuitive card movement between columns using @dnd-kit
- **Real-Time Synchronization** — Live updates via Socket.IO for multi-user collaboration
- **Agent Panel** — Dedicated view showing agent activity and task assignments
- **Column Management** — Customizable columns (To Do, In Progress, Review, Done, etc.)
- **Task Cards** — Rich task cards with title, description, priority, assignee, and metadata
- **Search and Filter** — Quick search and filtering by status, priority, assignee
- **Responsive Design** — Works on desktop and tablet screens

### Integration Points

- **mmx-cli** — Command-line task management synchronized with the board
- **Claude Code** — AI-assisted task creation and updates
- **Cursor Agent** — Visual task board for agent-driven workflows

## Architecture

```
board-ui/
├── app/                    # Next.js application
│   ├── page.tsx           # Main board view
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles + Tailwind
├── components/
│   ├── Board.tsx          # Main Kanban board component
│   ├── Column.tsx         # Individual column with drop zone
│   ├── TaskCard.tsx       # Draggable task card
│   ├── TaskModal.tsx      # Task detail/edit modal
│   ├── AgentPanel.tsx     # Agent activity sidebar
│   ├── Header.tsx         # Top navigation bar
│   └── Providers.tsx      # Socket.IO and state providers
├── hooks/
│   ├── useSocket.ts       # Socket.IO connection hook
│   ├── useBoard.ts        # Board state management
│   └── useTasks.ts        # Task CRUD operations
├── lib/
│   ├── socket.ts          # Socket.IO client configuration
│   ├── store.ts           # Zustand store definition
│   └── types.ts           # TypeScript interfaces
├── server/
│   └── socket.ts          # Socket.IO server handlers
└── package.json           # Dependencies
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 | React framework with App Router |
| State | Zustand | Lightweight state management |
| Real-time | Socket.IO | WebSocket communication |
| DnD | @dnd-kit | Drag-and-drop functionality |
| Styling | Tailwind CSS | Utility-first CSS |
| Icons | lucide-react | Icon library |

## Usage

### Prerequisites

- Node.js 18+
- pnpm or npm
- Running instance of multica-orchestrator

### Installation

```bash
cd .antigravity/plugins/board-ui
pnpm install
```

### Development

```bash
cd .antigravity/plugins/board-ui
pnpm dev
```

The board will be available at `http://localhost:3000`

### Production Build

```bash
cd .antigravity/plugins/board-ui
pnpm build
pnpm start
```

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `task:create` | `TaskInput` | Create new task |
| `task:update` | `{ id, updates }` | Update task |
| `task:move` | `{ taskId, columnId, position }` | Move task between columns |
| `task:delete` | `taskId` | Delete task |
| `column:create` | `ColumnInput` | Create new column |
| `column:update` | `{ id, updates }` | Update column |
| `column:delete` | `columnId` | Delete column |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `task:created` | `Task` | Broadcast new task |
| `task:updated` | `Task` | Broadcast task update |
| `task:moved` | `MoveResult` | Broadcast task move |
| `task:deleted` | `taskId` | Broadcast task deletion |
| `board:state` | `BoardState` | Full board sync on connect |

## Task Schema

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  labels?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Column {
  id: string;
  title: string;
  position: number;
  color?: string;
  taskIds: string[];
}
```

## State Management (Zustand)

The board uses Zustand for centralized state:

```typescript
interface BoardStore {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (taskId: string, toColumn: string, position: number) => void;
  deleteTask: (id: string) => void;
  
  addColumn: (column: Column) => void;
  updateColumn: (id: string, updates: Partial<Column>) => void;
  deleteColumn: (id: string) => void;
  reorderColumns: (columnOrder: string[]) => void;
}
```

## Configuration

### Environment Variables

```env
# Socket.IO server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Board title
NEXT_PUBLIC_BOARD_TITLE="Forgewright Board"
```

### Customization

Edit `lib/constants.ts` to customize:
- Default columns
- Priority colors
- Board title and branding

## Agent Panel

The Agent Panel shows real-time activity from connected agents:

- Agent ID and status
- Current task being processed
- Activity log with timestamps
- Quick actions (assign task, view history)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | Create new task |
| `F` | Focus search |
| `Esc` | Close modal/deselect |
| `?` | Show shortcuts help |

## Troubleshooting

### Socket Connection Issues

If real-time sync isn't working:

1. Verify multica-orchestrator is running
2. Check `NEXT_PUBLIC_SOCKET_URL` environment variable
3. Ensure CORS settings allow your domain

### Drag-and-Drop Not Working

1. Clear browser cache
2. Check for console errors
3. Verify @dnd-kit is properly installed

## Contributing

When extending the board-ui plugin:

1. Follow the existing component structure
2. Use TypeScript for all new code
3. Add Socket.IO events for any new real-time features
4. Update this SKILL.md with new features

## Related Plugins

- **multica-orchestrator** — Backend orchestrator providing task coordination
- **mmx-cli** — CLI tool for task management
