# Board UI

A real-time Kanban board for managing multi-agent tasks in Forgewright. Built with Next.js, React, and WebSocket for live updates.

## Overview

The Board UI provides a visual interface for tracking tasks across different stages of completion. It integrates with the Multica Orchestrator daemon to receive real-time updates as agents complete work.

**Features:**
- Drag-and-drop task management
- Real-time updates via WebSocket
- Agent assignment and status tracking
- Priority-based task sorting
- Column-based workflow (Todo, In Progress, Review, Done)

## Quick Start

```bash
cd .antigravity/plugins/board-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Task Columns
- **Todo** - Tasks waiting to be picked up
- **In Progress** - Currently active tasks
- **Review** - Tasks awaiting review
- **Done** - Completed tasks

### Agent Sidebar
- View all registered agents
- See agent status (idle, busy, offline)
- Filter tasks by agent

### Task Cards
- Title and description
- Priority indicator (low, medium, high, critical)
- Assigned agent
- Progress percentage
- Time tracking

### Real-time Updates
- Instant sync with Multica daemon
- Live task status changes
- Agent activity indicators

## Development

```bash
# Start dev server with hot reload
npm run dev

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Project Structure

```
src/
├── app/           # Next.js app router
├── components/    # React components
│   ├── Board.tsx      # Main board container
│   ├── Column.tsx     # Kanban column
│   ├── TaskCard.tsx   # Individual task card
│   └── AgentSidebar.tsx
├── hooks/         # Custom React hooks
│   └── useRealtime.ts # WebSocket hook
├── lib/           # Utilities
│   ├── socket.ts      # Socket.io client
│   └── utils.ts       # Helper functions
└── store/         # State management
    └── board.ts       # Zustand store
```

### Tech Stack
- **Framework:** Next.js 14
- **UI:** React 18
- **Styling:** Tailwind CSS
- **Drag & Drop:** @dnd-kit
- **State:** Zustand
- **Realtime:** Socket.io-client

## Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `ws://localhost:8765` |
| `PORT` | Server port | `3000` |

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
