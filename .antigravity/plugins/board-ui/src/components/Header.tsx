'use client'

import { useBoardStore } from '@/store/board'
import { Activity, Wifi, WifiOff, Plus } from 'lucide-react'

export function Header() {
  const { isConnected, tasks } = useBoardStore()
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  
  return (
    <header className="h-14 border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-primary" />
        <h1 className="font-semibold text-lg">Forgewright Board</h1>
        {pendingTasks > 0 && (
          <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-sm rounded-full">
            {pendingTasks} pending
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {isConnected ? (
          <div className="flex items-center gap-1.5 text-green-600">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-red-600">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">Disconnected</span>
          </div>
        )}
        
        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  )
}
