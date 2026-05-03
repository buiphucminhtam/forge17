'use client';

import { EnvironmentStatus } from '@/components/hub/EnvironmentStatus';
import { Activity } from 'lucide-react';

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar - same as main */}
      <aside className="w-64 border-r border-border bg-bg-secondary p-4">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-accent-primary" />
          <h1 className="text-lg font-semibold text-text-primary">Multica Hub</h1>
        </div>

        <nav className="space-y-1">
          {[
            { href: '/', label: 'Workspaces', icon: 'layout-dashboard' },
            { href: '/agents', label: 'Agents', icon: 'users' },
            { href: '/status', label: 'Status', icon: 'activity' },
            { href: '/settings', label: 'Settings', icon: 'settings' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.href === '/status'
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            System Status
          </h2>
          <p className="text-sm text-text-muted mb-6">
            Real-time status of all Forgewright services and components.
            Auto-refreshes every 30 seconds.
          </p>

          <EnvironmentStatus />

          <div className="mt-6 p-4 bg-bg-card rounded-xl border border-border">
            <h3 className="font-medium text-text-primary mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/settings"
                className="p-3 bg-bg-secondary rounded-lg hover:bg-bg-hover transition-colors text-sm text-text-secondary hover:text-text-primary"
              >
                Configure Ports
              </a>
              <a
                href="/"
                className="p-3 bg-bg-secondary rounded-lg hover:bg-bg-hover transition-colors text-sm text-text-secondary hover:text-text-primary"
              >
                View Workspaces
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
