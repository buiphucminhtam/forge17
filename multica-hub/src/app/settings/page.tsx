'use client';

import { useState } from 'react';
import { Settings, Database, Wifi, Keyboard, Bell, Moon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'connection', label: 'Connection', icon: Wifi },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-bg-secondary p-4">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-accent-primary" />
          <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-accent-primary/10 text-accent-primary'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-text-primary">Appearance</h3>
                    <p className="text-sm text-text-muted">Customize the look and feel</p>
                  </div>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      isDarkMode ? 'bg-accent-primary' : 'bg-bg-hover'
                    )}
                  >
                    <Moon
                      className={cn(
                        'h-4 w-4 text-white transition-transform',
                        isDarkMode ? 'rotate-0' : 'rotate-90'
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-bg-card rounded-xl border border-border p-6">
                <h3 className="font-medium text-text-primary mb-4">Hub Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hubPort">Hub Port</Label>
                    <Input id="hubPort" defaultValue="4000" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="hubUrl">Hub URL</Label>
                    <Input id="hubUrl" defaultValue="http://localhost:4000" className="mt-1.5" />
                  </div>
                </div>
              </div>

              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-bg-card rounded-xl border border-border p-6">
                <h3 className="font-medium text-text-primary mb-4">Database Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Type</span>
                    <span className="text-sm text-text-primary font-mono">SQLite</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Location</span>
                    <span className="text-sm text-text-primary font-mono">prisma/dev.db</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Size</span>
                    <span className="text-sm text-text-primary font-mono">2.4 MB</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline">Open in Studio</Button>
                <Button variant="outline">Backup Database</Button>
              </div>
            </div>
          )}

          {activeTab === 'connection' && (
            <div className="space-y-6">
              <div className="bg-bg-card rounded-xl border border-border p-6">
                <h3 className="font-medium text-text-primary mb-4">Daemon Ports</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Start Port</span>
                    <Input className="w-24" defaultValue="8765" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Max Daemons</span>
                    <Input className="w-24" defaultValue="10" />
                  </div>
                </div>
              </div>

              <div className="bg-bg-card rounded-xl border border-border p-6">
                <h3 className="font-medium text-text-primary mb-4">WebSocket Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Transport</span>
                    <span className="text-sm text-text-primary">websocket, polling</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Reconnection</span>
                    <span className="text-sm text-text-primary">5 attempts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              <div className="bg-bg-card rounded-xl border border-border p-6">
                <h3 className="font-medium text-text-primary mb-4">Keyboard Shortcuts</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Add Workspace', keys: '⌘ + N' },
                    { action: 'Add Task', keys: '⌘ + T' },
                    { action: 'Search', keys: '⌘ + K' },
                    { action: 'Settings', keys: '⌘ + ,' },
                    { action: 'Toggle Dark Mode', keys: '⌘ + D' },
                  ].map((shortcut) => (
                    <div key={shortcut.action} className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{shortcut.action}</span>
                      <kbd className="px-2 py-1 bg-bg-secondary rounded text-xs font-mono text-text-primary">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-bg-card rounded-xl border border-border p-6">
                <h3 className="font-medium text-text-primary mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Task updates', enabled: true },
                    { label: 'Agent status changes', enabled: true },
                    { label: 'Connection status', enabled: false },
                    { label: 'Sound effects', enabled: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{item.label}</span>
                      <button
                        className={cn(
                          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                          item.enabled ? 'bg-accent-primary' : 'bg-bg-hover'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                            item.enabled ? 'translate-x-5' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
