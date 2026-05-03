'use client';

import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { IDEBadge } from '@/components/agent/IDEBadge';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  type: 'mmx' | 'cursor' | 'vscode';
  status: 'idle' | 'busy' | 'offline';
  currentTask?: string;
  workspaceName?: string;
}

// Mock agents data
const mockAgents: Agent[] = [
  { id: 'a1', name: 'mmx-cli', type: 'mmx', status: 'busy', currentTask: 'Setup CI/CD', workspaceName: 'Forgewright' },
  { id: 'a2', name: 'cursor-agent', type: 'cursor', status: 'idle', workspaceName: 'Forgewright' },
  { id: 'a3', name: 'cursor-agent', type: 'cursor', status: 'busy', currentTask: 'Fix auth bug', workspaceName: 'My Project' },
  { id: 'a4', name: 'vscode-agent', type: 'vscode', status: 'offline', workspaceName: 'Legacy App' },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setAgents(mockAgents), 500);
    return () => clearTimeout(timer);
  }, []);

  const onlineAgents = agents.filter((a) => a.status !== 'offline');
  const idleAgents = agents.filter((a) => a.status === 'idle');
  const busyAgents = agents.filter((a) => a.status === 'busy');

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="border-b border-border bg-bg-secondary px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-accent-primary" />
            <h1 className="text-xl font-semibold text-text-primary">Agent Pool</h1>
            <span className="text-xs text-text-muted bg-bg-card px-2 py-0.5 rounded-full">
              {onlineAgents.length} online
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-bg-card rounded-xl border border-border p-4">
              <div className="text-sm text-text-muted mb-1">Online</div>
              <div className="text-2xl font-semibold text-status-online">{onlineAgents.length}</div>
            </div>
            <div className="bg-bg-card rounded-xl border border-border p-4">
              <div className="text-sm text-text-muted mb-1">Idle</div>
              <div className="text-2xl font-semibold text-status-busy">{idleAgents.length}</div>
            </div>
            <div className="bg-bg-card rounded-xl border border-border p-4">
              <div className="text-sm text-text-muted mb-1">Busy</div>
              <div className="text-2xl font-semibold text-accent-primary">{busyAgents.length}</div>
            </div>
          </div>

          {/* Agent List */}
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-bg-card rounded-xl border border-border p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <IDEBadge agent={agent} showStatus />
                  <div>
                    <p className="font-medium text-text-primary">{agent.name}</p>
                    <p className="text-sm text-text-muted">{agent.workspaceName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {agent.currentTask && (
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Working on</p>
                      <p className="text-sm text-text-secondary">{agent.currentTask}</p>
                    </div>
                  )}
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      agent.status === 'idle' && 'bg-status-online/10 text-status-online',
                      agent.status === 'busy' && 'bg-status-busy/10 text-status-busy',
                      agent.status === 'offline' && 'bg-status-offline/10 text-status-offline'
                    )}
                  >
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
