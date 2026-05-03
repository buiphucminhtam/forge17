import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Status = 'pending' | 'claimed' | 'running' | 'completed' | 'failed'
export type Priority = 1 | 2 | 3 | 4 | 5

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  assignedAgent?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  result?: string
  error?: string
}

export interface Agent {
  id: string
  name: string
  cli: string
  version?: string
  capabilities: string[]
  priority: number
  status: 'available' | 'busy' | 'offline'
}

interface BoardState {
  tasks: Task[]
  agents: Agent[]
  selectedTask: Task | null
  isConnected: boolean
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  moveTask: (id: string, newStatus: Status) => void
  deleteTask: (id: string) => void
  selectTask: (task: Task | null) => void
  
  // Agent actions
  setAgents: (agents: Agent[]) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  
  // Connection
  setConnected: (connected: boolean) => void
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      tasks: [],
      agents: [],
      selectedTask: null,
      isConnected: false,
      
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),
      moveTask: (id, newStatus) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, status: newStatus } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      selectTask: (task) => set({ selectedTask: task }),
      
      setAgents: (agents) => set({ agents }),
      updateAgent: (id, updates) => set((state) => ({
        agents: state.agents.map((a) => a.id === id ? { ...a, ...updates } : a)
      })),
      
      setConnected: (connected) => set({ isConnected: connected }),
    }),
    { name: 'board-storage' }
  )
)
