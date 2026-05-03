'use client';

import { Activity, CheckCircle2, Clock, FolderOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType = 'neutral', icon }: StatCardProps) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-muted">{title}</span>
        <div className="h-8 w-8 rounded-lg bg-bg-secondary flex items-center justify-center text-text-secondary">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-text-primary">{value}</span>
        {change && (
          <span
            className={cn(
              'text-xs mb-1',
              changeType === 'positive' && 'text-status-online',
              changeType === 'negative' && 'text-status-error',
              changeType === 'neutral' && 'text-text-muted'
            )}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

export function GlobalStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Workspaces"
        value={3}
        icon={<FolderOpen className="h-4 w-4" />}
      />
      <StatCard
        title="Active Agents"
        value={4}
        change="+2 today"
        changeType="positive"
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Tasks Today"
        value={12}
        change="+5"
        changeType="positive"
        icon={<Clock className="h-4 w-4" />}
      />
      <StatCard
        title="Completion Rate"
        value="78%"
        change="+3%"
        changeType="positive"
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
    </div>
  );
}
