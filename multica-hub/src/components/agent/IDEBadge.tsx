'use client';

import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  type: 'mmx' | 'cursor' | 'vscode';
  status?: 'idle' | 'busy' | 'offline';
}

interface IDEBadgeProps {
  agent: Agent;
  size?: 'sm' | 'md';
  showStatus?: boolean;
}

const ideConfig = {
  mmx: {
    label: 'M',
    bg: 'bg-ide-mmx',
    text: 'text-white',
    name: 'Antigravity/mmx',
  },
  cursor: {
    label: 'C',
    bg: 'bg-ide-cursor',
    text: 'text-white',
    name: 'Cursor',
  },
  vscode: {
    label: 'V',
    bg: 'bg-ide-vscode',
    text: 'text-white',
    name: 'VSCode',
  },
};

const statusColors = {
  idle: 'bg-status-online',
  busy: 'bg-status-busy',
  offline: 'bg-status-offline',
};

export function IDEBadge({ agent, size = 'md', showStatus = false }: IDEBadgeProps) {
  const config = ideConfig[agent.type] || ideConfig.mmx;
  const isSmall = size === 'sm';

  return (
    <div className="flex items-center gap-1.5" title={`${config.name}: ${agent.name}`}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-medium',
          config.bg,
          config.text,
          isSmall ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-xs'
        )}
      >
        {config.label}
      </div>
      {showStatus && agent.status && (
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            statusColors[agent.status] || statusColors.offline,
            agent.status === 'busy' && 'animate-pulse'
          )}
        />
      )}
    </div>
  );
}
