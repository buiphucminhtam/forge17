'use client';

import { Bot, Clock } from 'lucide-react';
import { IDEBadge } from './IDEBadge';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  type: 'mmx' | 'cursor' | 'vscode';
  status: 'idle' | 'busy' | 'offline';
  currentTask?: string;
  workspaceName?: string;
}

interface AgentPoolProps {
  agents: Agent[];
  className?: string;
}

const statusLabels = {
  idle: 'Idle',
  busy: 'Busy',
  offline: 'Offline',
};

export function AgentPool({ agents, className }: AgentPoolProps) {
  const onlineAgents = agents.filter((a) => a.status !== 'offline');
  const busyAgents = agents.filter((a) => a.status === 'busy');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent-primary" />
          <h3 className="font-medium text-text-primary">Agent Pool</h3>
          <span className="text-xs text-text-muted bg-bg-card px-2 py-0.5 rounded-full">
            {onlineAgents.length} online
          </span>
        </div>
        {busyAgents.length > 0 && (
          <span className="text-xs text-status-busy">
            {busyAgents.length} busy
          </span>
        )}
      </div>

      {/* Agent List */}
      <div className="space-y-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center justify-between p-3 bg-bg-card rounded-lg border border-border"
          >
            <div className="flex items-center gap-3">
              <IDEBadge agent={agent} showStatus />
              <div>
                <p className="text-sm font-medium text-text-primary">{agent.name}</p>
                {agent.workspaceName && (
                  <p className="text-xs text-text-muted">{agent.workspaceName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {agent.currentTask && (
                <div className="text-right">
                  <p className="text-xs text-text-muted">Working on:</p>
                  <p className="text-xs text-text-secondary truncate max-w-[150px]">
                    {agent.currentTask}
                  </p>
                </div>
              )}
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  agent.status === 'idle' && 'bg-status-online/10 text-status-online',
                  agent.status === 'busy' && 'bg-status-busy/10 text-status-busy',
                  agent.status === 'offline' && 'bg-status-offline/10 text-status-offline'
                )}
              >
                {statusLabels[agent.status]}
              </span>
            </div>
          </div>
        ))}

        {agents.length === 0 && (
          <div className="text-center py-6 text-text-muted text-sm">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No agents connected</p>
          </div>
        )}
      </div>
    </div>
  );
}
