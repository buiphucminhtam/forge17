'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useRealtime } from '@/hooks/useRealtime'

const RealtimeContext = createContext<ReturnType<typeof useRealtime> | null>(null)

export function BoardProvider({ children }: { children: ReactNode }) {
  const realtime = useRealtime()
  
  return (
    <RealtimeContext.Provider value={realtime}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useBoardRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useBoardRealtime must be used within BoardProvider')
  }
  return context
}
