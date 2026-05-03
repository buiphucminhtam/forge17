'use client';

import { useState, useEffect } from 'react';
import { WorkspaceCard } from './WorkspaceCard';

interface TaskCount {
  todo: number;
  inProgress: number;
  review: number;
  done: number;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface Workspace {
  id: string;
  name: string;
  path: string;
  daemonPort: number;
  boardPort: number;
  status: 'online' | 'offline' | 'error';
  taskCounts: TaskCount;
  agents: Agent[];
  lastSeen: string;
  createdAt: string;
}

// Mock data for demo
const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Forgewright',
    path: '~/dev/forgewright',
    daemonPort: 8765,
    boardPort: 3000,
    status: 'online',
    taskCounts: { todo: 3, inProgress: 2, review: 1, done: 8 },
    agents: [
      { id: 'a1', name: 'mmx-cli', type: 'mmx', status: 'busy' },
      { id: 'a2', name: 'cursor-agent', type: 'cursor', status: 'idle' },
    ],
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'My Project',
    path: '~/dev/my-project',
    daemonPort: 8766,
    boardPort: 3001,
    status: 'online',
    taskCounts: { todo: 5, inProgress: 1, review: 0, done: 3 },
    agents: [
      { id: 'a3', name: 'cursor-agent', type: 'cursor', status: 'idle' },
    ],
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Legacy App',
    path: '~/dev/legacy',
    daemonPort: 8767,
    boardPort: 3002,
    status: 'offline',
    taskCounts: { todo: 2, inProgress: 0, review: 0, done: 10 },
    agents: [],
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export function WorkspaceGrid() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setWorkspaces(mockWorkspaces);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-bg-card rounded-xl border border-border p-6 animate-pulse"
          >
            <div className="h-6 bg-bg-hover rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-bg-hover rounded w-3/4 mb-6"></div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-12 bg-bg-hover rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-bg-card mb-4">
          <svg
            className="h-6 w-6 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-1">No workspaces yet</h3>
        <p className="text-sm text-text-muted">
          Add your first workspace to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </div>
  );
}
