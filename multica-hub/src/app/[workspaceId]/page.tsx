'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { AddTaskModal } from '@/components/board/AddTaskModal';
import { IDEBadge } from '@/components/agent/IDEBadge';

// Mock data
const mockWorkspace = {
  id: '1',
  name: 'Forgewright',
  path: '~/dev/forgewright',
  status: 'online' as const,
  agents: [
    { id: 'a1', name: 'mmx-cli', type: 'mmx' as const, status: 'busy' },
    { id: 'a2', name: 'cursor-agent', type: 'cursor' as const, status: 'idle' },
  ],
};

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: { id: string; name: string; type: string };
  createdAt: string;
}

const mockTasks: Task[] = [
  { id: 't1', title: 'Setup CI/CD pipeline', status: 'todo', priority: 'high', createdAt: '2024-01-15' },
  { id: 't2', title: 'Implement auth flow', status: 'todo', priority: 'medium', createdAt: '2024-01-14' },
  { id: 't3', title: 'Write unit tests', status: 'todo', priority: 'low', createdAt: '2024-01-13' },
  { id: 't4', title: 'API integration', status: 'in_progress', priority: 'high', assignee: { id: 'a1', name: 'mmx-cli', type: 'mmx' }, createdAt: '2024-01-12' },
  { id: 't5', title: 'Fix navigation bug', status: 'in_progress', priority: 'urgent', assignee: { id: 'a2', name: 'cursor-agent', type: 'cursor' }, createdAt: '2024-01-11' },
  { id: 't6', title: 'Code review PR #42', status: 'review', priority: 'medium', assignee: { id: 'a1', name: 'mmx-cli', type: 'mmx' }, createdAt: '2024-01-10' },
  { id: 't7', title: 'Update dependencies', status: 'done', priority: 'low', createdAt: '2024-01-09' },
  { id: 't8', title: 'Fix login bug', status: 'done', priority: 'high', createdAt: '2024-01-08' },
];

export default function WorkspaceDetailPage({ params }: { params: { workspaceId: string } }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const workspace = mockWorkspace;

  const handleTaskMove = (taskId: string, newStatus: Task['status']) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    );
  };

  const handleTaskCreate = (title: string, priority: Task['priority']) => {
    const newTask: Task = {
      id: `t${Date.now()}`,
      title,
      status: 'todo',
      priority,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-bg-secondary px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-text-primary">{workspace.name}</h1>
                <span className="h-2 w-2 rounded-full bg-status-online status-pulse" />
              </div>
              <p className="text-sm text-text-muted font-mono">{workspace.path}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Agents */}
            <div className="flex items-center gap-2 mr-4">
              <span className="text-xs text-text-muted">Agents:</span>
              {workspace.agents.map((agent) => (
                <IDEBadge key={agent.id} agent={agent} showStatus />
              ))}
            </div>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 p-6 overflow-auto">
        <KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} />
      </main>

      <AddTaskModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleTaskCreate}
      />
    </div>
  );
}
