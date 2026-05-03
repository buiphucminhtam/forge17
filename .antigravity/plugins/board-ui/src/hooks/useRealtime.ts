'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useBoardStore, Task, Status } from '@/store/board'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8765'

export function useRealtime() {
  const socketRef = useRef<Socket | null>(null)
  const { 
    addTask, 
    moveTask, 
    updateTask, 
    setTasks,
    setAgents,
    setConnected,
  } = useBoardStore()

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    // Sync initial state
    socket.on('tasks:sync', (tasks: Task[]) => {
      setTasks(tasks)
    })

    socket.on('agents:sync', (agents: any[]) => {
      setAgents(agents)
    })

    // Task events
    socket.on('task:created', (task: Task) => {
      addTask(task)
    })

    socket.on('task:moved', ({ taskId, newStatus }: { taskId: string, newStatus: Status }) => {
      moveTask(taskId, newStatus)
    })

    socket.on('task:updated', ({ taskId, updates }: { taskId: string, updates: Partial<Task> }) => {
      updateTask(taskId, updates)
    })

    socket.on('task:completed', ({ taskId, result }: { taskId: string, result: string }) => {
      updateTask(taskId, { status: 'completed', result })
    })

    socket.on('task:failed', ({ taskId, error }: { taskId: string, error: string }) => {
      updateTask(taskId, { status: 'failed', error })
    })
  }, [addTask, moveTask, updateTask, setTasks, setAgents, setConnected])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
    setConnected(false)
  }, [setConnected])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data)
  }, [])

  return { connect, disconnect, emit, socket: socketRef }
}
