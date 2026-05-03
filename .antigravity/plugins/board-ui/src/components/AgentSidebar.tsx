'use client'

import { useBoardStore } from '@/store/board'
import { Bot, CheckCircle, Loader2, XCircle } from 'lucide-react'

const AGENT_ICONS: Record<string, string> = {
  'mmx': '🔮',
  'claude': '🧠',
  'cursor': '💭',
}

export function AgentSidebar() {
  const { agents } = useBoardStore()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'busy':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'offline':
        return <XCircle className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  return (
    <aside className="w-64 border-r bg-card p-4 overflow-y-auto">
      <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5" />
        Agents
      </h2>
      
      <div className="space-y-3">
        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No agents detected. Start the daemon to see agents.
          </p>
        ) : (
          agents.map(agent => (
            <div
              key={agent.id}
              className="p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{AGENT_ICONS[agent.cli] || '🤖'}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {agent.cli} v{agent.version || '?'}
                  </div>
                </div>
                {getStatusIcon(agent.status)}
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {agent.capabilities.slice(0, 4).map(cap => (
                  <span
                    key={cap}
                    className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 p-3 rounded-lg bg-muted/50">
        <h3 className="font-medium text-sm mb-2">Quick Tips</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Drag tasks between columns</li>
          <li>• Click a task to see details</li>
          <li>• mmx-cli is the primary agent</li>
        </ul>
      </div>
    </aside>
  )
}
