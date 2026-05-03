'use client';

import Link from 'next/link';
import { Folder, MoreHorizontal, ExternalLink } from 'lucide-react';
import type { Workspace } from './WorkspaceGrid';
import { cn } from '@/lib/utils';

interface WorkspaceCardProps {
  workspace: Workspace;
}

const statusColors = {
  online: 'bg-status-online',
  offline: 'bg-status-offline',
  error: 'bg-status-error',
};

const statusTextColors = {
  online: 'text-status-online',
  offline: 'text-status-offline',
  error: 'text-status-error',
};

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const totalTasks =
    workspace.taskCounts.todo +
    workspace.taskCounts.inProgress +
    workspace.taskCounts.review +
    workspace.taskCounts.done;

  return (
    <Link href={`/${workspace.id}`} className="block group">
      <div
        className={cn(
          'bg-bg-card rounded-xl border border-border p-5 transition-all duration-150',
          'hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/5',
          'hover:-translate-y-0.5'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-bg-hover flex items-center justify-center">
              <Folder className="h-5 w-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                {workspace.name}
              </h3>
              <p className="text-xs text-text-muted font-mono truncate max-w-[180px]">
                {workspace.path}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  statusColors[workspace.status],
                  workspace.status === 'online' && 'status-pulse'
                )}
              />
              <span className={cn('text-xs capitalize', statusTextColors[workspace.status])}>
                {workspace.status}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Task Summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-text-muted mb-2">
            <span>{totalTasks} tasks</span>
            <span>{workspace.agents.length} agents</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-bg-secondary rounded-lg p-2 text-center">
              <div className="text-lg font-semibold text-text-secondary">
                {workspace.taskCounts.todo}
              </div>
              <div className="text-[10px] text-text-muted uppercase">Todo</div>
            </div>
            <div className="bg-bg-secondary rounded-lg p-2 text-center">
              <div className="text-lg font-semibold text-ide-cursor">
                {workspace.taskCounts.inProgress}
              </div>
              <div className="text-[10px] text-text-muted uppercase">WIP</div>
            </div>
            <div className="bg-bg-secondary rounded-lg p-2 text-center">
              <div className="text-lg font-semibold text-status-busy">
                {workspace.taskCounts.review}
              </div>
              <div className="text-[10px] text-text-muted uppercase">Review</div>
            </div>
            <div className="bg-bg-secondary rounded-lg p-2 text-center">
              <div className="text-lg font-semibold text-status-online">
                {workspace.taskCounts.done}
              </div>
              <div className="text-[10px] text-text-muted uppercase">Done</div>
            </div>
          </div>
        </div>

        {/* Agents */}
        {workspace.agents.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {workspace.agents.map((agent) => (
                <div
                  key={agent.id}
                  className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-medium',
                    agent.type === 'mmx' && 'bg-ide-mmx text-white',
                    agent.type === 'cursor' && 'bg-ide-cursor text-white',
                    agent.type === 'vscode' && 'bg-ide-vscode text-white'
                  )}
                  title={`${agent.name} (${agent.status})`}
                >
                  {agent.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-text-muted">
          <span>
            Daemon: <span className="font-mono">{workspace.daemonPort}</span>
          </span>
          <span>Board: <span className="font-mono">{workspace.boardPort}</span></span>
        </div>
      </div>
    </Link>
  );
}
