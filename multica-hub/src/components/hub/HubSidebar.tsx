'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Activity, Users, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Workspaces', icon: LayoutDashboard },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/status', label: 'Status', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function HubSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-bg-secondary flex flex-col">
      <div className="p-4 flex-1">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent-primary/10 text-accent-primary'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Quick Actions
          </h3>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full text-left transition-colors bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20">
            <FolderPlus className="h-4 w-4" />
            Add Workspace
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-primary to-ide-mmx flex items-center justify-center">
            <span className="text-white text-xs font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">User</p>
            <p className="text-xs text-text-muted">Local Session</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
