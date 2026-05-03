'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBoardStore } from '@/store/board'
import { useBoardRealtime } from './BoardProvider'
import { GripVertical, Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface TaskCardProps {
  task: any
  isDragging?: boolean
}

const PRIORITY_COLORS = {
  1: 'bg-red-100 text-red-800',
  2: 'bg-orange-100 text-orange-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-blue-100 text-blue-800',
  5: 'bg-gray-100 text-gray-800',
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const { selectTask, selectedTask } = useBoardStore()
  const { emit } = useBoardRealtime()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const isSelected = selectedTask?.id === task.id

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-card rounded-lg border p-3 cursor-pointer
        hover:border-primary/50 transition-colors
        ${isSelected ? 'ring-2 ring-primary' : 'border-border'}
        ${isDragging ? 'shadow-lg' : ''}
      `}
      onClick={() => selectTask(task)}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority]}`}>
              P{task.priority}
            </span>
            {task.status === 'completed' && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {task.status === 'failed' && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          
          <h3 className="font-medium text-sm truncate">{task.title}</h3>
          
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
            {task.assignedAgent && (
              <span className="ml-auto text-primary">{task.assignedAgent}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
